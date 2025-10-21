import { ArgumentMetadata, BadRequestException, PipeTransform } from '@nestjs/common';
import { isNumber, isNumberString } from 'class-validator';
import { NetworksUtils } from '../enums/networks';

export class ParseChainIdPipe implements PipeTransform {
  constructor(readonly params?: { optional?: boolean }) {}

  transform(value: string, metadata: ArgumentMetadata): number | undefined {
    if (!value && this.params?.optional) return undefined;

    if (!isNumberString(value) && !isNumber(value)) {
      throw new BadRequestException(`Expected a numeric value for '${metadata.data}' but received: '${value}'`);
    }

    if (!NetworksUtils.isValidChainId(Number(value))) {
      throw new BadRequestException(`The provided chain id: '${value}' is not supported yet`);
    }

    return Number(value);
  }
}

export class ParseOptionalChainIdPipe extends ParseChainIdPipe {
  constructor() {
    super({ optional: true });
  }
}
