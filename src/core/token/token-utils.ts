import { ChainId } from '@core/enums/chain-id';
import { OrderDirection } from '@core/enums/order-direction';
import { TokenOrderField } from '@core/enums/token/token-order-field';
import { ITokenOrder } from '@core/interfaces/token/token-order.interface';

export const TokenUtils = {
  areTokensTheSame,
  sumTotalValuePooledUsd,
  sortTokenList,
  buildTokenId,
};

function sumTotalValuePooledUsd(tokens: { trackedTotalValuePooledUsd: number }[]): number {
  return tokens.reduce((sum, token) => sum + token.trackedTotalValuePooledUsd, 0);
}

function areTokensTheSame(
  token1: { normalizedName: string; normalizedSymbol: string },
  token2: { normalizedName: string; normalizedSymbol: string },
): boolean {
  const clean = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .trim();

  const name1 = clean(token1.normalizedName);
  const name2 = clean(token2.normalizedName);
  const symbol1 = token1.normalizedSymbol.toLowerCase();
  const symbol2 = token2.normalizedSymbol.toLowerCase();

  // 1. Identity Match (Names match exactly)
  if (name1 === name2) return true;

  // 2. Cross-Match (Name contains the symbol)
  // Handles: Name "Wrapped Ether" vs Symbol "WETH" and "Wrapped Ether" vs "Ether" (Symbol "ETH")
  if (name1.includes(symbol2) || name2.includes(symbol1)) return true;

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
  if (words1[0] !== words2[0]) return false;

  // 5. Similarity Score (The "Brand" Check)
  const uniqueWords = new Set([...words1, ...words2]);
  const overlap = words1.filter((w) => words2.includes(w));

  // We need at least 50% shared vocabulary
  const similarity = overlap.length / uniqueWords.size;

  return similarity >= 0.5;
}

function sortTokenList(tokens: { totalValuePooledUsd: number }[], order: ITokenOrder): void {
  tokens.sort((a, b) => {
    let comparison = 0;

    switch (order.field) {
      case TokenOrderField.TVL:
        comparison = (a.totalValuePooledUsd ?? 0) - (b.totalValuePooledUsd ?? 0);
        break;
    }

    return order.direction === OrderDirection.ASC ? comparison : -comparison;
  });
}

function buildTokenId(chainId: ChainId, address: string): string {
  return `${chainId}-${address.toLowerCase()}`;
}
