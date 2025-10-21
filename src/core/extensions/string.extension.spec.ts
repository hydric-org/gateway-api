import '../extensions/string.extension';

describe('StringExtension', () => {
  it('should return true if both passed strings are equal ignoring case', () => {
    expect('abc'.lowercasedEquals('ABC')).toBe(true);
  });

  it('should return false if any of the passed strings is null or undefined', () => {
    expect('abc'.lowercasedEquals(undefined)).toBe(false);
  });

  it('should return false if both passed strings are not equal ignoring case', () => {
    expect('abc'.lowercasedEquals('DEF')).toBe(false);
  });

  it('returns false when value is null (use fallback)', () => {
    const someString: string | null = null;
    expect((someString ?? '').hasValue()).toBe(false);
  });

  it('returns false when value is undefined (nullish coalesce)', () => {
    const someString: string | undefined = undefined;
    expect((someString ?? '').hasValue()).toBe(false);
  });

  it('returns false for empty string', () => {
    const someString = '';
    expect(someString.hasValue()).toBe(false);
  });

  it('returns true for non-empty string', () => {
    const someString = 'hello';
    expect(someString.hasValue()).toBe(true);
  });
});
