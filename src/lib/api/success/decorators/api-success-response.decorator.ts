import { Type, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { SuccessResponse } from '../dtos/success-response.dto';

interface ApiSuccessResponseOptions {
  isArray?: boolean;
  description?: string;
}

export const ApiSuccessResponse = <TModel extends Type<any>>(model: TModel, options?: ApiSuccessResponseOptions) => {
  return applyDecorators(
    ApiExtraModels(SuccessResponse, model),
    ApiOkResponse({
      description: options?.description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(SuccessResponse) },
          {
            properties: {
              data: options?.isArray
                ? {
                    type: 'array',
                    items: { $ref: getSchemaPath(model) },
                  }
                : {
                    $ref: getSchemaPath(model),
                  },
            },
          },
        ],
      },
    }),
  );
};
