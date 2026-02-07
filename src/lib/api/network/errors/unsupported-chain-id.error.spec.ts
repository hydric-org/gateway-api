import { ChainIdUtils } from '@core/enums/chain-id';
import { UnsupportedChainIdError } from './unsupported-chain-id.error';

import { UnsupportedChainIdMetadata } from '@lib/api/error/dtos/metadata/unsupported-chain-id-metadata.dto';

describe('UnsupportedChainIdError', () => {
  const supportedIds = ChainIdUtils.values();
  const invalidId = 999999;
  const anotherInvalidId = 888888;

  it('should format message with a single unsupported chain ID', () => {
    const error = new UnsupportedChainIdError({ chainId: invalidId });
    const metadata = error.params.metadata as UnsupportedChainIdMetadata;

    expect(error.message).toBe(`Unsupported Chain ID: ${invalidId}`);
    expect(metadata.unsupportedIds).toEqual([invalidId]);
    expect(metadata.supportedIds).toEqual(supportedIds);
  });

  it('should format message with only unsupported IDs from an array', () => {
    const validId = supportedIds[0];
    const error = new UnsupportedChainIdError({ chainId: [validId, invalidId, anotherInvalidId] });
    const metadata = error.params.metadata as UnsupportedChainIdMetadata;

    expect(error.message).toBe(`Unsupported Chain ID: ${invalidId}, ${anotherInvalidId}`);
    expect(metadata.unsupportedIds).toEqual([invalidId, anotherInvalidId]);
    expect(metadata.chainId).toEqual([validId, invalidId, anotherInvalidId]);
  });

  it('should return supportedIds as an array in metadata', () => {
    const error = new UnsupportedChainIdError({ chainId: invalidId });
    const metadata = error.params.metadata as UnsupportedChainIdMetadata;

    expect(Array.isArray(metadata.supportedIds)).toBe(true);
    expect(metadata.supportedIds).toEqual(supportedIds);
  });

  it('should fallback to all provided IDs if none are theoretically unsupported', () => {
    // This case shouldn't happen in real usage, but tests the fallback logic
    const validId = supportedIds[0];
    const error = new UnsupportedChainIdError({ chainId: [validId] });
    expect(error.message).toBe(`Unsupported Chain ID: ${validId}`);
  });
});
