import { ArgumentMetadata, BadRequestException, PipeTransform } from '@nestjs/common';
import { isEthereumAddress, isString } from 'class-validator';

export class ParseAddressPipe implements PipeTransform<string> {
  constructor(
    readonly params?: {
      optional: boolean;
    },
  ) {}

  transform(value: string, metadata: ArgumentMetadata): string | undefined {
    if (!isString(value) && value) {
      throw new BadRequestException(`Expected a string value for '${metadata.data}' but received ${typeof value}`);
    }

    if (this.params?.optional && (!value || !value.hasValue())) return;

    if (!value || !value.hasValue()) {
      throw new BadRequestException(`An Ethereum-like address should be provided for ${metadata.data}`);
    }

    if (!isEthereumAddress(value)) {
      throw new BadRequestException(
        `Invalid ethereum-like address for ${metadata.data}: '${value}'. Please provide a valid address with 42 characters`,
      );
    }

    return value;
  }
}

export class ParseOptionalAddressPipe extends ParseAddressPipe {
  constructor() {
    super({ optional: true });
  }
}
