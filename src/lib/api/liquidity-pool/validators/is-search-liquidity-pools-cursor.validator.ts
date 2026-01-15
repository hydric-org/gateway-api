import { ValidatorKey } from '@lib/api/common/validator-key';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { SearchLiquidityPoolsCursor } from '../search-liquidity-pools-cursor.dto';

export function IsSearchLiquidityPoolsCursor(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: ValidatorKey.IS_SEARCH_LIQUIDITY_POOLS_CURSOR,
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsSearchLiquidityPoolsCursorConstraint,
    });
  };
}

@ValidatorConstraint({ name: ValidatorKey.IS_SEARCH_LIQUIDITY_POOLS_CURSOR, async: false })
export class IsSearchLiquidityPoolsCursorConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (value == null || value === '') return true;
    if (typeof value !== 'string') return false;

    try {
      const parsed = JSON.parse(Buffer.from(value, 'base64url').toString()) as Record<string, unknown>;
      const instance = new SearchLiquidityPoolsCursor();

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
    return 'cursor must be a valid base64-encoded JSON object representing a cursor to search liquidity pools.';
  }
}
