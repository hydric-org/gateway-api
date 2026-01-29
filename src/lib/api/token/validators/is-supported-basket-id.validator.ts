import { BasketIdUtils } from '@core/enums/token/basket-id.enum';
import { ValidatorKey } from '@lib/api/common/validator-key';
import { ValidationErrorCode } from '@lib/api/error/error-codes/validation-error-codes';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export function isSupportedBasketId(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: ValidatorKey.IS_SUPPORTED_BASKET_ID,
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsSupportedBasketIdConstraint,
    });
  };
}

@ValidatorConstraint({ name: ValidatorKey.IS_SUPPORTED_BASKET_ID, async: false })
export class IsSupportedBasketIdConstraint implements ValidatorConstraintInterface {
  validationErrorCode(): ValidationErrorCode {
    return ValidationErrorCode.INVALID_BASKET_ID;
  }

  validate(value: any): boolean {
    if (typeof value !== 'string') {
      return false;
    }

    return BasketIdUtils.includes(value);
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be a supported token basket id: ${BasketIdUtils.values().join(', ')}.`;
  }
}
