import { ChainId } from '@core/enums/chain-id';
import { CoreErrorCode } from '@core/enums/core-error-code';
import { BasketId } from '@core/enums/token/basket-id.enum';
import { BaseError } from './base-core-error';

export class SingleChainTokenBasketNotFoundError extends BaseError<{ basketId: string; chainId: number }> {
  constructor(params: { basketId: BasketId; chainId: ChainId }) {
    super({
      message: `Couldn't find the token basket '${params.basketId}' on chain id ${params.chainId}`,
      errorCode: CoreErrorCode.TOKEN_BASKET_NOT_FOUND,
      details: 'The requested token basket does not exist or has no assets on the specified network.',
      metadata: { basketId: params.basketId, chainId: params.chainId },
    });
  }
}
