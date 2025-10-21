import { ArgumentMetadata, BadRequestException } from '@nestjs/common';
import sinon from 'sinon';
import 'src/core/extensions/string.extension';
import { ParseAddressPipe, ParseOptionalAddressPipe } from './address.pipe';

describe('ParseAddressPipe', () => {
  let sut: ParseAddressPipe;
  let metadata: sinon.SinonStubbedInstance<ArgumentMetadata>;

  beforeEach(() => {
    metadata = {
      type: 'body',
      data: 'address',
      metatype: String,
    };

    sut = new ParseAddressPipe();
  });

  it('should throw an error if the address is not a valid eth address', () => {
    const value = 'not an address';
    const expectedError = new BadRequestException(
      `Invalid ethereum-like address for ${metadata.data}: '${value}'. Please provide a valid address with 42 characters`,
    );

    expect(() => {
      sut.transform(value, metadata);
    }).toThrow(expectedError);
  });

  it('should throw an error if the value is undefined and is not optional', () => {
    sut = new ParseAddressPipe({ optional: false });

    const value = undefined;
    const expectedError = new BadRequestException(`An Ethereum-like address should be provided for ${metadata.data}`);

    expect(() => {
      // @ts-expect-error expecting error
      sut.transform(value, metadata);
    }).toThrow(expectedError);
  });

  it('should throw an error if the value is null and is not optional', () => {
    sut = new ParseAddressPipe({ optional: false });

    const value = null;
    const expectedError = new BadRequestException(`An Ethereum-like address should be provided for ${metadata.data}`);

    expect(() => {
      // @ts-expect-error expecting error
      sut.transform(value, metadata);
    }).toThrow(expectedError);
  });

  it('should throw an error if the value is empty and is not optional', () => {
    sut = new ParseAddressPipe({ optional: false });

    const value = '';
    const expectedError = new BadRequestException(`An Ethereum-like address should be provided for ${metadata.data}`);

    expect(() => {
      sut.transform(value, metadata);
    }).toThrow(expectedError);
  });

  it('should return undefined if the value is empty and is optional', () => {
    sut = new ParseAddressPipe({ optional: true });

    const value = '';
    const result = sut.transform(value, metadata);

    expect(result).toBe(undefined);
  });

  it('should return undefined if the value is null and is optional', () => {
    sut = new ParseAddressPipe({ optional: true });

    const value = null;
    // @ts-expect-error expecting error
    const result = sut.transform(value, metadata);

    expect(result).toBe(undefined);
  });

  it('should return undefined if the value is undefined and is optional', () => {
    sut = new ParseAddressPipe({ optional: true });

    const value = undefined;
    // @ts-expect-error expecting error
    const result = sut.transform(value, metadata);

    expect(result).toBe(undefined);
  });

  it('should throw is passing a non string value', () => {
    sut = new ParseAddressPipe({ optional: true });

    const value = 21;

    // @ts-expect-error expecting error
    expect(() => sut.transform(value, metadata)).toThrow(
      new BadRequestException(`Expected a string value for '${metadata.data}' but received ${typeof value}`),
    );
  });

  it('should return the value if the address is valid', () => {
    const value = '0x1234567890123456789012345678901234567890';
    const result = sut.transform(value, metadata);

    expect(result).toBe(value);
  });

  it('should make the address pipe optional when instanciating the ParseOptionalAddressPipe', () => {
    const pipe = new ParseOptionalAddressPipe();

    expect(pipe.params?.optional).toBe(true);
  });
});
