import { ChainId } from '@core/enums/chain-id';
import { CoreErrorCode } from '@core/enums/core-error-code';
import { BasketId } from '@core/enums/token/basket-id.enum';
import { BaseError } from './base-core-error';

export class MultiChainTokenBasketNotFoundError extends BaseError<{ basketId: string; chainIds?: number[] }> {
  constructor(params: { basketId: BasketId; chainIds?: ChainId[] }) {
    const hasChainIds = params.chainIds && params.chainIds.length > 0;

    super({
      message: hasChainIds
        ? `Couldn't find the token basket '${params.basketId}' on any of the requested networks`
        : `Couldn't find the token basket '${params.basketId}' on any supported network`,
      errorCode: CoreErrorCode.TOKEN_BASKET_NOT_FOUND,
      details: 'The requested token basket does not exist or has no assets on the requested networks.',
      metadata: { basketId: params.basketId, chainIds: params.chainIds },
    });
  }
}
