import { Transform } from 'class-transformer';

export function Round(decimals: number) {
  return Transform(({ value }) => {
    if (value === null || value === undefined) return value;

    const num = Number(value);

    if (!Number.isFinite(num)) return value;

    return Number(num.toFixed(decimals));
  });
}
