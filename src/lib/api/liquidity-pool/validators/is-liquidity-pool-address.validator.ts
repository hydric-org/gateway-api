import { ValidatorKey } from '@lib/api/common/validator-key';
import {
  isEthereumAddress,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export function IsLiquidityPoolAddress(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: ValidatorKey.IS_POOL_ADDRESS,
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsLiquidityPoolAddressConstraint,
    });
  };
}

@ValidatorConstraint({ name: ValidatorKey.IS_POOL_ADDRESS, async: false })
export class IsLiquidityPoolAddressConstraint implements ValidatorConstraintInterface {
  validate(address: any): boolean {
    if (typeof address !== 'string') {
      return false;
    }

    const v4PoolAddressRegex = /^0x[a-fA-F0-9]{64}$/;
    return isEthereumAddress(address) || v4PoolAddressRegex.test(address);
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be a valid liquidity pool address, either an ethereum address or a v4 liquidity pool id. Both starting with '0x'`;
  }
}
