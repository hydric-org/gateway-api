import { NetworkUtils } from '@core/enums/network';
import { IBlockchainAddress } from '@core/interfaces/blockchain-address.interface';
import { BaseApiError } from '../../error/errors/base-api-error';
import { ValidationErrorCode } from '../../error/validation-error-codes';
import { BlockchainAddressUtils } from '../blockchain-address-utils';

export class InvalidBlockchainAddressError extends BaseApiError {
  constructor(params: { blockchainAddress: unknown; property: string }) {
    const rawValue = params.blockchainAddress;
    const isArray = Array.isArray(rawValue);

    const allValues = (isArray ? rawValue : [rawValue]) as IBlockchainAddress[];
    const invalidItems = allValues
      .map((item) => ({
        address: item,
        reason: BlockchainAddressUtils.getBlockchainAddressValidationError(item),
      }))
      .filter((result) => result.reason !== null);

    const culprits = invalidItems.length > 0 ? invalidItems : [];

    super({
      message:
        isArray && culprits.length > 1
          ? `One or more Blockchain Addresses are invalid (${culprits.length} found)`
          : `Invalid Blockchain Address at property ${params.property}.`,

      errorCode: ValidationErrorCode.INVALID_BLOCKCHAIN_ADDRESS,

      details: `Blockchain Addresses must be an object containing a valid chainId and a valid address. Supported chain IDs: [${NetworkUtils.values().join(', ')}].`,

      metadata: {
        invalidAddresses: isArray ? culprits : culprits[0],
        receivedCount: allValues.length,
        ...(isArray && { totalInvalid: culprits.length }),
      },
    });
  }
}
