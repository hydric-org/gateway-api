import { EnvKey } from '@lib/app/env-key.enum';
import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DecoratorKey } from '../common/decorator-key';
import { _Internal_BilledObjectResponse } from '../pricing/dtos/billed-object-response.dto';

@Injectable()
export class ObjectCostInterceptor implements NestInterceptor {
  constructor(
    readonly reflector: Reflector,
    readonly configService: ConfigService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const isPublicRoute = this.reflector.getAllAndOverride<boolean>(DecoratorKey.PUBLIC_ROUTE, [
      context.getHandler(),
      context.getClass(),
    ]);

    const response = context.switchToHttp().getResponse();
    const request = context.switchToHttp().getRequest();

    let apiKey = request.headers.authorization;
    if (apiKey) apiKey = apiKey.split(' ')[1];

    return next.handle().pipe(
      map((data) => {
        if (isPublicRoute) {
          setOCHeader(response, 0);
          return data;
        }

        if (!(data instanceof _Internal_BilledObjectResponse)) {
          throw new InternalServerErrorException('Unbilled response detected on a route not marked as unbilled.');
        }

        const OCCostPerObject = this.reflector.get<number>(DecoratorKey.OBJECT_COST, data.objectType) ?? 0;
        const totalOCUsed = OCCostPerObject * (data.count || 0);

        if (OCCostPerObject === 0) {
          throw new InternalServerErrorException(
            `Object cost is 0 for ${data.objectType.name} Object in a billed route.`,
          );
        }

        if (apiKey === this.configService.get(EnvKey.DOCS_API_KEY) && totalOCUsed > 200) {
          throw new BadRequestException(
            'Cannot use more than 200 object credits in a non public route with the docs API key. Please either use a different API Key or decrease the number of objects returned.',
          );
        }

        setOCHeader(response, totalOCUsed);

        return data;
      }),
    );
  }
}

const setOCHeader = (response: any, totalOCUsed: number) => {
  response.setHeader('x-hydric-oc-cost', totalOCUsed.toString());
};
