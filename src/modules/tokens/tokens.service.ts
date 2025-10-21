import { Injectable } from '@nestjs/common';
import { ZERO_ETHEREUM_ADDRESS } from 'src/core/constants';
import { MultichainTokenDTO } from 'src/core/dtos/multi-chain-token.dto';
import { SingleChainTokenDTO } from 'src/core/dtos/single-chain-token-dto';
import { TokenGroupDTO } from 'src/core/dtos/token-group.dto';
import { TokenPriceDTO } from 'src/core/dtos/token-price-dto';
import { Networks } from 'src/core/enums/networks';
import { IndexerClient } from 'src/core/indexer-client';
import { TokenRepository } from 'src/core/repositories/token-repository';
import { tokenGroupList } from 'src/core/token-group-list';
import { tokenList } from 'src/core/token-list';
import '../../core/extensions/string.extension';

@Injectable()
export class TokensService {
  constructor(
    private readonly indexerService: IndexerClient,
    private readonly tokenRepository: TokenRepository,
  ) {}

  getPopularTokens(network?: Networks): MultichainTokenDTO[] {
    if (network === undefined) return tokenList;

    return tokenList
      .filter((token) => {
        const tokenAddress = token.addresses[network];
        return tokenAddress !== undefined && tokenAddress !== null;
      })
      .sort((a, b) => {
        const aIsZero = a.addresses[network] === ZERO_ETHEREUM_ADDRESS;
        const bIsZero = b.addresses[network] === ZERO_ETHEREUM_ADDRESS;

        if (aIsZero && !bIsZero) return -1;
        if (!aIsZero && bIsZero) return 1;
        return 0;
      });
  }

  getTokenGroups(network?: Networks): TokenGroupDTO[] {
    let rawGroups = structuredClone(tokenGroupList);

    if (network === undefined) return rawGroups;

    rawGroups = rawGroups.map((group) => {
      group.tokens = group.tokens.filter((groupToken) => {
        const tokenAddress = groupToken?.addresses[network];
        return tokenAddress !== undefined && tokenAddress !== null;
      });

      return group;
    });

    return rawGroups.filter((group) => group.tokens.length > 0);
  }

  searchTokensByNameOrSymbol(query: string, network?: Networks): MultichainTokenDTO[] {
    const _tokenList =
      network === undefined ? tokenList : tokenList.filter((token) => token.addresses[network] !== null);

    return _tokenList.filter((token) => {
      return (
        token.name.toLowerCase().includes(query.toLowerCase()) ||
        token.symbol.toLowerCase().includes(query.toLowerCase())
      );
    });
  }

  async getTokenByAddress(network: Networks, address: string): Promise<SingleChainTokenDTO> {
    return this.tokenRepository.getTokenByAddress(network, address, {
      useCache: false,
    });
  }

  async getTokenPrice(tokenAddress: string, network: Networks): Promise<TokenPriceDTO> {
    const token = await this.indexerService.querySingleToken(network, tokenAddress);

    return {
      address: tokenAddress,
      usdPrice: Number(token.usdPrice),
    };
  }
}
