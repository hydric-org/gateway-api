import { ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { Network } from '../enums/networks';
import { ParseChainIdPipe, ParseOptionalChainIdPipe } from './chain-id.pipe';

describe('ChainIdPipe', () => {
  let sut: ParseChainIdPipe;
  let metadata: ArgumentMetadata;

  beforeEach(() => {
    sut = new ParseChainIdPipe();
    metadata = {
      type: 'body',
      data: 'chainId',
      metatype: String,
    };
  });

  it('should return undefined if the value is undefined and is optional', () => {
    sut = new ParseChainIdPipe({ optional: true });

    // @ts-expect-error testing undefined
    expect(sut.transform(undefined, metadata)).toBeUndefined();
  });

  it('should throw if the passed value is a string but not a number', () => {
    const value = 'not a number';

    const expectedError = new BadRequestException(
      `Expected a numeric value for '${metadata.data}' but received: '${value}'`,
    );

    expect(() => sut.transform(value, metadata)).toThrow(expectedError);
  });

  it('should throw if the passed value is a either not a string number or a number', () => {
    const value = false;

    const expectedError = new BadRequestException(
      `Expected a numeric value for '${metadata.data}' but received: '${value}'`,
    );

    // @ts-expect-error expecting error
    expect(() => sut.transform(value, metadata)).toThrow(expectedError);
  });

  it('should throw if the passed value is a number, but is not a chain id mapped at networks', () => {
    const value = 99171;

    const expectedError = new BadRequestException(`The provided chain id: '${value}' is not supported yet`);

    // @ts-expect-error expecting error
    expect(() => sut.transform(value, metadata)).toThrow(expectedError);
  });

  it('should return the passed number if the number is a mapped chain id', () => {
    const value = Network.UNICHAIN;
    // @ts-expect-error expecting error
    const result = sut.transform(value, metadata);

    expect(result).toBe(value);
  });

  it('should return the passed string number as a number if the string number is a mapped chain id', () => {
    const value = `${Network.ETHEREUM}`;
    const result = sut.transform(value, metadata);

    expect(result).toBe(Number(value));
  });

  it('should be optional when instantiating the ParseOptionalChainIdPipe pipe', () => {
    const instance = new ParseOptionalChainIdPipe();

    expect(instance.params?.optional).toBe(true);
  });
});
