import { ValidatorKey } from '@lib/api/common/validator-key';
import { ProtocolId } from '@lib/identifiers/protocol-id';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export function IsProtocolId(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: ValidatorKey.IS_PROTOCOL_ID,
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsProtocolIdConstraint,
    });
  };
}

@ValidatorConstraint({ name: ValidatorKey.IS_PROTOCOL_ID, async: false })
export class IsProtocolIdConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (Array.isArray(value)) return value.every((v) => ProtocolId.isValid(v));

    return ProtocolId.isValid(value);
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be kebab-case (lowercase, hyphen-separated, no spaces). Example: "uniswap-v3".`;
  }
}
