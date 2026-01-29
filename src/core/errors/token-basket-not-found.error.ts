import { ChainId } from '@core/enums/chain-id';
import { CoreErrorCode } from '@core/enums/core-error-code';
import { BasketId } from '@core/enums/token/basket-id.enum';
import { BaseError } from './base-core-error';

export class TokenBasketNotFoundError extends BaseError {
  constructor(params: { basketId: BasketId; chainId?: ChainId }) {
    super({
      message: params.chainId
        ? `Couldn't find the token basket '${params.basketId}' on chain id ${params.chainId}`
        : `Couldn't find the token basket '${params.basketId}' on any supported network`,
      errorCode: CoreErrorCode.TOKEN_BASKET_NOT_FOUND,
      details: 'The requested token basket does not exist or has no assets on the specified network.',
      metadata: { basketId: params.basketId, chainId: params.chainId },
    });
  }
}
