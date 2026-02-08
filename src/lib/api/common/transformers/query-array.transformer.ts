import { Transform } from 'class-transformer';

/**
 * Transforms query param values into arrays.
 * Handles: undefined, null, single values, comma-separated strings, and arrays.
 * Does not perform validation - leaves that to validators.
 */
export function TransformQueryArray<T = string>(parseValue?: (value: string) => T) {
  return Transform(({ value }) => {
    if (value === undefined || value === null) return undefined;

    if (typeof value === 'string') {
      if (value.trim() === '') return undefined;
      const values = value
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v !== '');
      if (values.length === 0) return undefined;
      return parseValue ? values.map(parseValue) : values;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) return undefined;
      return parseValue ? value.map((v: string) => parseValue(String(v))) : value;
    }

    const singleValue = parseValue ? parseValue(String(value)) : value;
    return [singleValue];
  });
}

export function TransformNumberArray() {
  return TransformQueryArray<number>((v) => Number(v));
}

export function TransformStringArray() {
  return TransformQueryArray<string>((v) => String(v));
}
