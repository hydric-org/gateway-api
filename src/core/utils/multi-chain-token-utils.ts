import { MultichainTokenDTO } from '../dtos/multi-chain-token.dto';

export function extractNetworkAddressFromTokens(tokens: MultichainTokenDTO[], network: number): string[] {
  return tokens.filter((token) => token?.addresses[network] !== null).map((token) => token?.addresses[network]);
}
