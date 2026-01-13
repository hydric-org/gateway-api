import { NetworkUtils } from '@core/enums/network';
import { ValidatorKey } from '@lib/api/common/validator-key';
import { ValidationErrorCode } from '@lib/api/error/validation-error-codes';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export function isSupportedChainId(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: ValidatorKey.IS_SUPPORTED_CHAIN_ID,
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsSupportedChainIdConstraint,
    });
  };
}

@ValidatorConstraint({ name: ValidatorKey.IS_SUPPORTED_CHAIN_ID, async: false })
export class IsSupportedChainIdConstraint implements ValidatorConstraintInterface {
  validationErrorCode(): ValidationErrorCode {
    return ValidationErrorCode.UNSUPPORTED_CHAIN_ID;
  }

  validate(value: any): boolean {
    if (typeof value === 'number' && Number.isInteger(value)) {
      return NetworkUtils.isValidChainId(value);
    }

    if (typeof value === 'string' && /^\d+$/.test(value)) {
      return NetworkUtils.isValidChainId(parseInt(value, 10));
    }

    return false;
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be a supported network chain id: ${NetworkUtils.values().join(', ')}.`;
  }
}
