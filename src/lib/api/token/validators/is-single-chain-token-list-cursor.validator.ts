import { ValidatorKey } from '@lib/api/common/validator-key';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { SingleChainTokenListCursor } from '../dtos/single-chain-token-list-cursor.dto';

export function IsSingleChainTokenListCursor(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: ValidatorKey.IS_SINGLE_CHAIN_TOKEN_LIST_CURSOR,
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsSingleChainTokenListCursorConstraint,
    });
  };
}

@ValidatorConstraint({ name: ValidatorKey.IS_SINGLE_CHAIN_TOKEN_LIST_CURSOR, async: false })
export class IsSingleChainTokenListCursorConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (value == null || value === '') return true;
    if (typeof value !== 'string') return false;

    try {
      const decoded = SingleChainTokenListCursor.decode(value);
      return decoded instanceof SingleChainTokenListCursor;
    } catch {
      return false;
    }
  }

  defaultMessage(): string {
    return 'cursor must be a valid base64-encoded cursor for single-chain token list pagination.';
  }
}
