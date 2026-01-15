import { ChainIdUtils } from '@core/enums/chain-id';
import { ValidatorKey } from '@lib/api/common/validator-key';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { BlockchainAddressUtils } from '../blockchain-address-utils';

export function IsBlockchainAddress(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: ValidatorKey.IS_VALID_ADDRESS,
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsBlockchainAddressConstraint,
    });
  };
}

@ValidatorConstraint({ name: ValidatorKey.IS_VALID_ADDRESS, async: false })
export class IsBlockchainAddressConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (Array.isArray(value)) return value.every((v) => BlockchainAddressUtils.isValidBlockchainAddress(v));

    return BlockchainAddressUtils.isValidBlockchainAddress(value);
  }

  defaultMessage(args: ValidationArguments): string {
    const validChainIds = ChainIdUtils.values().join(', ');
    return `${args.property} must contain a valid chainId (supported: [${validChainIds}]) and a valid ethereum address.`;
  }
}
