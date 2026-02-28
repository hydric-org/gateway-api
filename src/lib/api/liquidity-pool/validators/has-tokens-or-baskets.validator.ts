import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

interface HasTokensOrBasketsObject {
  tokensA?: unknown[];
  basketsA?: unknown[];
}

@ValidatorConstraint({ name: 'hasTokensOrBaskets', async: false })
export class HasTokensOrBasketsConstraint implements ValidatorConstraintInterface {
  validate(_value: unknown, args: ValidationArguments) {
    const object = args.object as HasTokensOrBasketsObject;
    const tokensA = object.tokensA;
    const basketsA = object.basketsA;

    const hasTokensA = Array.isArray(tokensA) && tokensA.length > 0;
    const hasBasketsA = Array.isArray(basketsA) && basketsA.length > 0;

    return hasTokensA || hasBasketsA;
  }

  defaultMessage() {
    return 'Either tokensA or basketsA must be provided and non-empty.';
  }
}

export function HasTokensOrBaskets(validationOptions?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  return function (constructor: Function) {
    registerDecorator({
      target: constructor,
      propertyName: '',
      options: validationOptions,
      constraints: [],
      validator: HasTokensOrBasketsConstraint,
    });
  };
}
