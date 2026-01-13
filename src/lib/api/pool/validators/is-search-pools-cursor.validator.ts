import { ValidatorKey } from '@lib/api/common/validator-key';
import { PoolSearchCursor } from '@lib/api/pool/search-pools-cursor.dto';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export function IsPoolSearchCursor(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: ValidatorKey.IS_POOL_SEARCH_CURSOR,
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsPoolSearchCursorConstraint,
    });
  };
}

@ValidatorConstraint({ name: ValidatorKey.IS_POOL_SEARCH_CURSOR, async: false })
export class IsPoolSearchCursorConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (value == null || value === '') return true;
    if (typeof value !== 'string') return false;

    try {
      const parsed = JSON.parse(Buffer.from(value, 'base64url').toString()) as Record<string, unknown>;
      const instance = new PoolSearchCursor();

      const typeOf = (v: unknown) => (v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v);

      for (const key of Object.keys(parsed)) {
        if (!(key in instance)) return false;

        const instVal = (instance as unknown as Record<string, unknown>)[key];
        const parsedVal = parsed[key];

        if (instVal === undefined) continue;

        if (typeOf(instVal) !== typeOf(parsedVal)) return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  defaultMessage(): string {
    return 'cursor must be a valid base64-encoded JSON object representing a cursor to search pools.';
  }
}
