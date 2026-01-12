import { NetworkUtils } from '@core/enums/network';
import { ValidatorKey } from '@lib/api/common/validator-key';
import { TokenId } from '@lib/identifiers/token-id';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export function IsValidTokenId(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: ValidatorKey.IS_VALID_TOKEN_ID,
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsValidTokenIdConstraint,
    });
  };
}

@ValidatorConstraint({ name: ValidatorKey.IS_VALID_TOKEN_ID, async: false })
export class IsValidTokenIdConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (Array.isArray(value)) return value.every((v) => TokenId.isValid(v));

    return TokenId.isValid(value);
  }

  defaultMessage(args: ValidationArguments): string {
    const validChainIds = NetworkUtils.values().join(', ');
    return `${args.property} must have the form '<chainId>-<address>' where chainId is one of [${validChainIds}] and address is a valid ethereum address.`;
  }
}
