import { PoolAddress } from '@lib/identifiers/pool-address';
import { ArgumentMetadata, BadRequestException, PipeTransform } from '@nestjs/common';
import { isString } from 'class-validator';

export class ParsePoolAddressPipe implements PipeTransform<string> {
  transform(value: string, metadata: ArgumentMetadata): string | undefined {
    if (!isString(value) && value) {
      throw new BadRequestException(`Expected a string value for '${metadata.data}' but received ${typeof value}`);
    }

    if (!value || !value.hasValue())
      throw new BadRequestException(`A pool address should be provided for ${metadata.data}`);

    if (!PoolAddress.isValid(value)) {
      throw new BadRequestException(
        `Invalid pool address for ${metadata.data}: '${value}'. Please provide a valid pool address`,
      );
    }

    return value;
  }
}
