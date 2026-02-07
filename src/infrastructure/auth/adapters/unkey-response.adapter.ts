import { IAPIKey } from '@core/interfaces/auth/api-key.interface';
import { ApiKeyStatus } from '@lib/api/auth/api-key-status';
import { Code, V2KeysVerifyKeyResponseBody } from '@unkey/api/dist/commonjs/models/components';

export const UnkeyResponseAdapter = {
  verifyToApiKey,
};

function verifyToApiKey(response: V2KeysVerifyKeyResponseBody): IAPIKey {
  return {
    status: codeToApiKeyStatus(response.data.code),
    expiredAt: response.data.expires,
    metadata: response.data.meta,
  };
}

function codeToApiKeyStatus(code: Code): ApiKeyStatus {
  if (code === 'VALID') {
    return ApiKeyStatus.VALID;
  }

  if (code === 'DISABLED') {
    return ApiKeyStatus.DISABLED;
  }

  if (code === 'EXPIRED') {
    return ApiKeyStatus.EXPIRED;
  }

  if (code === 'NOT_FOUND') {
    return ApiKeyStatus.NOT_FOUND;
  }

  return ApiKeyStatus.UNKNOWN;
}
