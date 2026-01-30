import { ChainIdUtils } from '@core/enums/chain-id';
import { UnsupportedChainIdError } from './unsupported-chain-id.error';

describe('UnsupportedChainIdError', () => {
  const supportedIds = ChainIdUtils.values();
  const invalidId = 999999;
  const anotherInvalidId = 888888;

  it('should format message with a single unsupported chain ID', () => {
    const error = new UnsupportedChainIdError({ chainId: invalidId });
    expect(error.message).toBe(`Unsupported Chain ID: ${invalidId}`);
    expect(error.params.metadata.unsupportedIds).toEqual([invalidId]);
    expect(error.params.metadata.supportedIds).toEqual(supportedIds);
  });

  it('should format message with only unsupported IDs from an array', () => {
    const validId = supportedIds[0];
    const error = new UnsupportedChainIdError({ chainId: [validId, invalidId, anotherInvalidId] });

    expect(error.message).toBe(`Unsupported Chain ID: ${invalidId}, ${anotherInvalidId}`);
    expect(error.params.metadata.unsupportedIds).toEqual([invalidId, anotherInvalidId]);
    expect(error.params.metadata.chainId).toEqual([validId, invalidId, anotherInvalidId]);
  });

  it('should return supportedIds as an array in metadata', () => {
    const error = new UnsupportedChainIdError({ chainId: invalidId });
    expect(Array.isArray(error.params.metadata.supportedIds)).toBe(true);
    expect(error.params.metadata.supportedIds).toEqual(supportedIds);
  });

  it('should fallback to all provided IDs if none are theoretically unsupported', () => {
    // This case shouldn't happen in real usage, but tests the fallback logic
    const validId = supportedIds[0];
    const error = new UnsupportedChainIdError({ chainId: [validId] });
    expect(error.message).toBe(`Unsupported Chain ID: ${validId}`);
  });
});
