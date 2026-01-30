import { ChainId } from '@core/enums/chain-id';
import { IBlockchainAddress } from '@core/interfaces/blockchain-address.interface';
import { ITokenBasketSourceResponse } from '../interfaces/token-basket-source-response.interface';

export const TokenBasketsResponseAdapter = {
  getChainIdsAndAddressesFromResponse,
};

function getChainIdsAndAddressesFromResponse(data: ITokenBasketSourceResponse): {
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
