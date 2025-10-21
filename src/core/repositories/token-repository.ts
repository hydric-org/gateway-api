import { Injectable } from '@nestjs/common';
import { MultichainTokenDTO } from '../dtos/multi-chain-token.dto';
import { SingleChainTokenDTO } from '../dtos/single-chain-token-dto';
import { Networks } from '../enums/networks';
import { IndexerClient } from '../indexer-client';
import { MemoryCache } from '../memory-cache';
import { tokenList } from '../token-list';

@Injectable()
export class TokenRepository {
  constructor(
    private readonly indexerClient: IndexerClient,
    private readonly memoryCache: MemoryCache,
  ) {}

  async getMultichainTokensByIds(ids: string[]): Promise<MultichainTokenDTO[]> {
    return Promise.resolve(tokenList.filter((token) => ids.includes(token.id)));
  }

  async getTokenByAddress(
    network: Networks,
    address: string,
    params?: {
      useCache: boolean;
    },
  ): Promise<SingleChainTokenDTO> {
    if (params?.useCache) {
      const cachedToken = this.memoryCache.getSingleChainToken(address, network);

      if (cachedToken) return cachedToken;
    }

    let tokenToReturn: SingleChainTokenDTO | undefined;

    const internalTokenMetadata = tokenList.find((token) => token.addresses[network]?.lowercasedEquals(address));

    if (internalTokenMetadata) {
      tokenToReturn = {
        address: address,
        decimals: internalTokenMetadata.decimals[network]!,
        name: internalTokenMetadata.name,
        symbol: internalTokenMetadata.symbol,
        logoUrl: internalTokenMetadata.logoUrl,
      };
    }

    if (!tokenToReturn) {
      const indexerToken = await this.indexerClient.querySingleToken(network, address);

      tokenToReturn = {
        address: address,
        decimals: indexerToken.decimals,
        name: indexerToken.name,
        symbol: indexerToken.symbol,
      };
    }

    this.memoryCache.setSingleChainToken(tokenToReturn, network);
    return tokenToReturn;
  }

  async getManyTokensFromManyNetworks(
    addressesPerNetwork: Record<number, Set<string>>,
  ): Promise<Record<number, Record<string, SingleChainTokenDTO>>> {
    const allPromises: {
      network: number;
      address: string;
      promise: Promise<SingleChainTokenDTO>;
    }[] = [];

    for (const [networkKey, addresses] of Object.entries(addressesPerNetwork)) {
      const network = Number(networkKey);

      for (const address of addresses) {
        allPromises.push({
          network,
          address,
          promise: this.getTokenByAddress(network, address, { useCache: true }),
        });
      }
    }

    const results = await Promise.all(allPromises.map((p) => p.promise));
    const tokensPerNetwork: Record<number, Record<string, SingleChainTokenDTO>> = {};

    allPromises.forEach(({ network, address }, index) => {
      tokensPerNetwork[network] = {
        ...tokensPerNetwork[network],
        [address]: results[index],
      };
    });

    return tokensPerNetwork;
  }
}
