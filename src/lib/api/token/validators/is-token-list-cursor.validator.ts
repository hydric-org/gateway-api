import { ValidatorKey } from '@lib/api/common/validator-key';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { MultiChainTokenListCursor } from '../dtos/multi-chain-token-list-cursor.dto';

export function IsTokenListCursor(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: ValidatorKey.IS_TOKEN_LIST_CURSOR,
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsTokenListCursorConstraint,
    });
  };
}

@ValidatorConstraint({ name: ValidatorKey.IS_TOKEN_LIST_CURSOR, async: false })
export class IsTokenListCursorConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (value == null || value === '') return true;
    if (typeof value !== 'string') return false;

    try {
      const decoded = MultiChainTokenListCursor.decode(value);
      return decoded instanceof MultiChainTokenListCursor;
    } catch {
      return false;
    }
  }

  defaultMessage(): string {
    return 'cursor must be a valid base64-encoded JSON object representing a cursor to paginate tokens.';
  }
}
