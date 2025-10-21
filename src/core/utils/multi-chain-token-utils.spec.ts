import { MultichainTokenDTO } from '../dtos/multi-chain-token.dto';
import { Networks } from '../enums/networks';
import { extractNetworkAddressFromTokens } from './multi-chain-token-utils';

describe('MultiChainTokenUtils', () => {
  it(`should extract the address from the multichain tokens at a single passed network
    when calling 'extractNetworkAddressFromTokens' and return it all as a single list
    of addresses. If the address at the network is null, it should be ignored`, () => {
    const network = Networks.ETHEREUM;

    const tokensList: MultichainTokenDTO[] = [
      {
        id: '1',
        name: 'Token 1',
        symbol: 'TOK1',
        logoUrl: 'https://logo.com',
        decimals: {
          [network]: 18,
        } as Record<number, number>,
        addresses: {
          [network]: '0xToko1',
          [Networks.BASE]: '0xToko1-Base',
        } as Record<number, string>,
      },
      {
        id: '2',
        name: 'Token 2',
        symbol: 'TOK2',
        logoUrl: 'https://logo.com',
        decimals: {
          [network]: 18,
        } as Record<number, number>,
        addresses: {
          [network]: '0xToko2',
          [Networks.BASE]: '0xToko2-Base',
        } as Record<number, string>,
      },
      {
        id: '3',
        name: 'Token 3',
        symbol: 'TOK3',
        logoUrl: 'https://logo.com',
        decimals: {
          [network]: 18,
        } as Record<number, number>,
        addresses: {
          [network]: null,
          [Networks.BASE]: '0xToko3-Base',
        } as Record<number, string | null>,
      },
    ];

    const result = extractNetworkAddressFromTokens(tokensList, Networks.ETHEREUM);

    expect(result).toEqual(['0xToko1', '0xToko2']);
  });
});
