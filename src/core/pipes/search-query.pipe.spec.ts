import { ArgumentMetadata, BadRequestException } from '@nestjs/common';
import 'src/core/extensions/string.extension';
import { ParseSearchQueryPipe } from './search-query.pipe';

describe('SearchQueryPipe', () => {
  let sut: ParseSearchQueryPipe;
  let metadata: ArgumentMetadata;

  beforeEach(() => {
    sut = new ParseSearchQueryPipe();

    metadata = {
      type: 'body',
      data: 'searchQuery',
      metatype: String,
    };
  });

  it('should throw if the passed value is undefined', () => {
    const expectedError = new BadRequestException(
      `A query string should be provided to ${metadata.data} in order to perform a search`,
    );

    // @ts-expect-error testing undefined
    expect(() => sut.transform(undefined, metadata)).toThrow(expectedError);
  });

  it('should throw if the passed value is null', () => {
    const expectedError = new BadRequestException(
      `A query string should be provided to ${metadata.data} in order to perform a search`,
    );

    // @ts-expect-error testing undefined
    expect(() => sut.transform(null, metadata)).toThrow(expectedError);
  });

  it('should throw if the passed value is empty string', () => {
    const expectedError = new BadRequestException(
      `A query string should be provided to ${metadata.data} in order to perform a search`,
    );

    expect(() => sut.transform('', metadata)).toThrow(expectedError);
  });

  it('should return the passed value if the passed value is not empty string', () => {
    const value = 'xabas';
    const result = sut.transform(value, metadata);

    expect(result).toBe(value);
  });
});
