import { OrderDirection } from '@core/enums/order-direction';
import { TokenOrderField } from '@core/enums/token/token-order-field';
import { IIndexerToken } from '@core/interfaces/token/indexer-token.interface';
import { IMultiChainToken } from '@core/interfaces/token/multi-chain-token.interface';
import { LiquidityPoolsIndexerClient } from '@infrastructure/indexer/clients/liquidity-pools-indexer-client';
import { Injectable } from '@nestjs/common';
import { MultiChainTokenDTO } from '../../lib/api/token/dtos/multi-chain-token.dto';

@Injectable()
export class TokensService {
  constructor(private readonly liquidityPoolsIndexer: LiquidityPoolsIndexerClient) {}

  async getMultiChainTokenList(limit: number): Promise<IMultiChainToken[]> {
    const uniqueSymbolsInOrder: string[] = [];
    const processedSymbolsSet = new Set<string>();
    const batchSize = limit * 2;
    let skip = 0;

    while (uniqueSymbolsInOrder.length < limit) {
      const tokensBatch = await this.liquidityPoolsIndexer.getTokens({
        orderBy: {
          direction: OrderDirection.DESC,
          field: TokenOrderField.TVL,
        },
        limit: batchSize,
        skip: skip,
      });

      if (tokensBatch.length === 0) break;

      for (const token of tokensBatch) {
        if (!processedSymbolsSet.has(token.symbol)) {
          processedSymbolsSet.add(token.symbol);

          uniqueSymbolsInOrder.push(token.symbol);
        }

        if (uniqueSymbolsInOrder.length === limit) break;
      }

      if (tokensBatch.length < batchSize) break;
      skip += batchSize;
    }

    if (uniqueSymbolsInOrder.length === 0) return [];

    const topTokensFromAllChains = await this.liquidityPoolsIndexer.getTokens({
      filter: {
        symbol: uniqueSymbolsInOrder,
        minTotalValuePooledUsd: 1000,
      },
      orderBy: {
        direction: OrderDirection.DESC,
        field: TokenOrderField.TVL,
      },
    });

    const topTokensBundledBySymbol = new Map<string, IIndexerToken[]>();

    for (const token of topTokensFromAllChains) {
      const group = topTokensBundledBySymbol.get(token.symbol) || [];

      group.push(token);
      topTokensBundledBySymbol.set(token.symbol, group);
    }

    const multichainTokenList: MultiChainTokenDTO[] = [];

    for (const symbol of uniqueSymbolsInOrder) {
      const tokenBundle = topTokensBundledBySymbol.get(symbol);
      if (!tokenBundle || tokenBundle.length === 0) continue;

      const anchorToken = tokenBundle[0];

      const validTokens: IIndexerToken[] = [];
      const seenChains = new Set<number>();

      for (const tokenCandidate of tokenBundle) {
        const priceDiffFromTopToken = Math.abs(tokenCandidate.trackedUsdPrice - anchorToken.trackedUsdPrice);
        const percentageDiff = priceDiffFromTopToken === 0 ? 0 : priceDiffFromTopToken / anchorToken.trackedUsdPrice;

        if (percentageDiff > 0.05) continue;

        if (!this._areTokensNamesSimilar(tokenCandidate, anchorToken)) continue;

        // Chain check: only one token per chain (the one with highest TVL)
        // Since group is sorted by TVL, the first one encountered for a chain is the best candidate
        if (seenChains.has(tokenCandidate.chainId)) continue;

        seenChains.add(tokenCandidate.chainId);
        validTokens.push(tokenCandidate);
      }

      const multichainToken: IMultiChainToken = {
        ids: validTokens.map((t) => `${t.chainId}-${t.address.toLowerCase()}`),
        addresses: validTokens.map((t) => t.address),
        chainIds: validTokens.map((t) => t.chainId),
        symbol: anchorToken.symbol,
        name: anchorToken.name,
        decimals: {},
      };

      validTokens.forEach((token) => (multichainToken.decimals[token.address] = token.decimals));
      multichainTokenList.push(multichainToken);
    }

    return multichainTokenList;
  }

  private _areTokensNamesSimilar(token1: IIndexerToken, token2: IIndexerToken): boolean {
    const clean = (name: string) =>
      name
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, '')
        .trim();

    const name1 = clean(token1.name);
    const name2 = clean(token2.name);
    const symbol1 = token1.symbol.toLowerCase();
    const symbol2 = token2.symbol.toLowerCase();

    // 1. Identity Match (Names match exactly)
    if (name1 === name2) return true;

    // 2. Cross-Match (Name is just the symbol)
    // Handles: Name "WETH" vs Name "Wrapped Ether" (Symbol WETH)
    if (name1 === symbol2 || name2 === symbol1) return true;

    // 3. Acronym Check
    // Handles: "USD Coin" (First word 'USD') vs "USDC" (First word 'USDC')
    const getAcronym = (name: string) =>
      name
        .split(' ')
        .map((w) => w[0])
        .join('');

    if (getAcronym(name1) === symbol2 || getAcronym(name2) === symbol1) return true;

    // 4. Word-Based Logic (Jaccard Similarity)
    const words1 = name1.split(' ').filter((w) => w.length > 0);
    const words2 = name2.split(' ').filter((w) => w.length > 0);

    // CRITICAL GUARD: First Word Mismatch
    // "USD Mapped Token" starts with "USD"
    // "USDM Stablecoin" starts with "USDM"
    // Since "USD" != "USDM", and neither is an acronym of the other (checked above), we FAIL here.
    if (words1[0] !== words2[0]) {
      return false;
    }

    // 5. Similarity Score (The "Brand" Check)
    const uniqueWords = new Set([...words1, ...words2]);
    const overlap = words1.filter((w) => words2.includes(w));

    // We need at least 50% shared vocabulary
    const similarity = overlap.length / uniqueWords.size;

    return similarity >= 0.5;
  }
}
