import { ChainId } from '@core/enums/chain-id';
import { IBlockchainAddress } from '@core/interfaces/blockchain-address.interface';
import { ITokenBasketSourceResponse } from '../interfaces/token-basket-source-response.interface';

import { BasketId } from '@core/enums/token/basket-id.enum';
import { ITokenBasketConfiguration } from '@core/interfaces/token/token-basket-configuration.interface';

export class TokenBasketsResponseAdapter {
  static getChainIdsAndAddressesFromResponse(data: ITokenBasketSourceResponse): {
    chainIds: ChainId[];
    addresses: IBlockchainAddress[];
  } {
    const chainIds: ChainId[] = [];
    const addresses: IBlockchainAddress[] = [];

    for (const [rawChainId, rawAddresses] of Object.entries(data.addresses)) {
      chainIds.push(Number(rawChainId));
      rawAddresses.forEach((address) => addresses.push({ chainId: Number(rawChainId), address }));
    }

    return { chainIds, addresses };
  }

  static toConfiguration(data: ITokenBasketSourceResponse): ITokenBasketConfiguration {
    const { chainIds, addresses } = this.getChainIdsAndAddressesFromResponse(data);

    return {
      id: data.id as BasketId,
      name: data.name,
      description: data.description,
      logoUrl: data.logo,
      chainIds,
      addresses,
    };
  }

  static filterBasketsByChainIds(
    baskets: ITokenBasketConfiguration[],
    chainIds?: ChainId[],
  ): ITokenBasketConfiguration[] {
    if (!chainIds || chainIds.length === 0) {
      return baskets;
    }

    const chainIdSet = new Set(chainIds.map(Number));

    return baskets
      .map((basket) => ({
        ...basket,
        chainIds: basket.chainIds.filter((id) => chainIdSet.has(id)),
        addresses: basket.addresses.filter((addr) => chainIdSet.has(addr.chainId)),
      }))
      .filter((basket) => basket.chainIds.length > 0);
  }
}
