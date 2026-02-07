import { ApiErrorCode } from '@lib/api/error/error-codes/api-error-codes';
import { ApiKeyNotFoundError } from './api-key-not-found.error';

describe('ApiKeyNotFoundError', () => {
  it('should mask a long API key (> 10 characters)', () => {
    const longKey = 'sk_live_123456789';
    const error = new ApiKeyNotFoundError({ receivedKey: longKey });

    expect(error.params.errorCode).toBe(ApiErrorCode.API_KEY_NOT_FOUND);
    expect(error.params.metadata.receivedKey).toBe('sk_l...789');
  });

  it('should mask a medium API key (5-10 characters)', () => {
    const mediumKey = '123456';
    const error = new ApiKeyNotFoundError({ receivedKey: mediumKey });

    expect(error.params.metadata.receivedKey).toBe('1...6');
  });

  it('should mask a short API key (<= 4 characters)', () => {
    const shortKey = '123';
    const error = new ApiKeyNotFoundError({ receivedKey: shortKey });

    expect(error.params.metadata.receivedKey).toBe('***');
  });

  it('should mask an empty string as ***', () => {
    const error = new ApiKeyNotFoundError({ receivedKey: '' });
    expect(error.params.metadata.receivedKey).toBe('***');
  });
});
