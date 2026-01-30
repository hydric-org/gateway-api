import { ChainId } from '@core/enums/chain-id';
import { UnsupportedChainIdError } from '@lib/api/network/errors/unsupported-chain-id.error';
import { BadRequestException } from '@nestjs/common';
import { ParseChainIdArrayPipe } from './parse-chain-id-array.pipe';

describe('ParseChainIdArrayPipe', () => {
  let pipe: ParseChainIdArrayPipe;

  beforeEach(() => {
    pipe = new ParseChainIdArrayPipe();
  });

  it('should return undefined if value is undefined', () => {
    expect(pipe.transform(undefined)).toBeUndefined();
  });

  it('should return undefined if value is empty string', () => {
    expect(pipe.transform('')).toBeUndefined();
    expect(pipe.transform('  ')).toBeUndefined();
  });

  it('should parse a single chain ID string', () => {
    expect(pipe.transform('1')).toEqual([ChainId.ETHEREUM]);
  });

  it('should parse a comma-separated list of chain IDs', () => {
    expect(pipe.transform('1,8453')).toEqual([ChainId.ETHEREUM, ChainId.BASE]);
  });

  it('should parse an array of chain ID strings', () => {
    expect(pipe.transform(['1', '8453'])).toEqual([ChainId.ETHEREUM, ChainId.BASE]);
  });

  it('should throw BadRequestException for non-numeric values', () => {
    expect(() => pipe.transform('1,abc')).toThrow(BadRequestException);
  });

  it('should throw UnsupportedChainIdError for invalid chain IDs', () => {
    expect(() => pipe.transform('1,999999')).toThrow(UnsupportedChainIdError);
  });

  it('should ignore empty values in list', () => {
    expect(pipe.transform('1,,8453')).toEqual([ChainId.ETHEREUM, ChainId.BASE]);
  });
});
