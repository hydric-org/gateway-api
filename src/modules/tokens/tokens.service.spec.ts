import { GraphQLClient } from 'graphql-request';
import { mock } from 'jest-mock-extended';
import sinon from 'sinon';
import { MultichainTokenDTO } from 'src/core/dtos/multi-chain-token.dto';
import { SingleChainTokenDTO } from 'src/core/dtos/single-chain-token-dto';
import { TokenPriceDTO } from 'src/core/dtos/token-price-dto';
import { Networks } from 'src/core/enums/networks';
import { IndexerClient } from 'src/core/indexer-client';
import { TokenRepository } from 'src/core/repositories/token-repository';
import { tokenGroupList } from 'src/core/token-group-list';
import { tokenList } from 'src/core/token-list';
import { TokensService } from './tokens.service';

describe('TokensService', () => {
  let tokensService: TokensService;
  let indexerClient: sinon.SinonStubbedInstance<IndexerClient>;
  let tokenRepository: sinon.SinonStubbedInstance<TokenRepository>;

  beforeEach(() => {
    const mockGraphQlClient = mock<GraphQLClient>();
    mockGraphQlClient.request.mockResolvedValue({
      Token: [
        <MultichainTokenDTO>{
          id: '1',
          addresses: { [Networks.SEPOLIA]: '0x1234567890123456789012345678901234567890' } as Record<Networks, string>,
          decimals: { [Networks.SEPOLIA]: 18 } as Record<Networks, number>,
          symbol: 'TEST',
          name: 'Test Token',
          usdPrice: 120.312,
          logoUrl: '',
        },
      ],
    });

    indexerClient = sinon.createStubInstance(IndexerClient);
    tokenRepository = sinon.createStubInstance(TokenRepository);

    tokensService = new TokensService(indexerClient, tokenRepository);
  });

  it('should return the token list if no network is provided to the getPopularTokens method', () => {
    const tokens = tokensService.getPopularTokens();

    expect(tokens).toEqual(tokenList);
  });

  it('should return the token list filtered with the network passed when calling getPopularTokens method passing a network', () => {
    const network = Networks.SEPOLIA;
    const tokens = tokensService.getPopularTokens(network);

    expect(tokens).toEqual(tokenList.filter((token) => token.addresses[network] !== null));
  });

  it('should return the tokens matching the query by name or symbol when calling searchTokensByNameOrSymbol method', () => {
    const query = 'us';

    const tokens = tokensService.searchTokensByNameOrSymbol(query);

    expect(tokens).toEqual(
      tokenList.filter((token) => {
        return (
          token.name.toLowerCase().includes(query.toLowerCase()) ||
          token.symbol.toLowerCase().includes(query.toLowerCase())
        );
      }),
    );
  });

  it(`should return the tokens matching the query by name or symbol
    in a specific network when calling searchTokensByNameOrSymbol
    method passing a network`, () => {
    const query = 'uni';
    const network = Networks.SEPOLIA;
    const tokens = tokensService.searchTokensByNameOrSymbol(query, network);

    expect(tokens).toEqual(
      tokenList
        .filter((token) => token.addresses[network] !== null)
        .filter((token) => {
          return (
            token.name.toLowerCase().includes(query.toLowerCase()) ||
            token.symbol.toLowerCase().includes(query.toLowerCase())
          );
        }),
    );
  });

  it(`should use the token repository to get the token metadata without using cache value
    when calling getTokenByAddress method`, async () => {
    const address = '0x1234567890123456789012345678901234567890';
    const network = Networks.SEPOLIA;
    const expectedToken: SingleChainTokenDTO = {
      address: address,
      decimals: 18,
      symbol: 'TEST',
      name: 'Test Token',
      logoUrl: '',
    };

    tokenRepository.getTokenByAddress.resolves(expectedToken);

    const receivedToken = await tokensService.getTokenByAddress(network, address);

    expect(receivedToken).toEqual(expectedToken);
    sinon.assert.calledOnceWithExactly(tokenRepository.getTokenByAddress, network, address, {
      useCache: false,
    });
  });

  it('should use the indexer to get the token price when calling getTokenPrice method', async () => {
    const tokenAddress = '0x1234567890123456AAAA12345678901234567890';
    const network = Networks.SEPOLIA;
    const expectedPrice = 120.312;

    indexerClient.querySingleToken.resolves({
      decimals: 18,
      id: tokenAddress,
      name: 'Test Token',
      symbol: 'TEST',
      usdPrice: expectedPrice.toString(),
    });

    const result = await tokensService.getTokenPrice(tokenAddress, network);
    const expectedResult: TokenPriceDTO = {
      address: tokenAddress,
      usdPrice: expectedPrice,
    };

    expect(result).toEqual(expectedResult);

    sinon.assert.calledOnceWithExactly(indexerClient.querySingleToken, network, tokenAddress);
  });

  it('should return the whole token group list when calling getTokenGroups method without passing a chainId', () => {
    const tokenGroups = tokensService.getTokenGroups();

    expect(tokenGroups).toEqual(tokenGroupList);
  });

  it('should return the token group filtered by network when calling getTokenGroups method passing a chainId', () => {
    const network = Networks.SEPOLIA;

    const tokenGroups = tokensService.getTokenGroups(network);

    const expectedReturn = tokenGroupList
      .map((group) => {
        group.tokens = group.tokens.filter((groupToken) => {
          const tokenAddress = groupToken?.addresses[network];
          return tokenAddress !== undefined && tokenAddress !== null;
        });

        return group;
      })
      .filter((group) => group.tokens.length > 0);

    expect(tokenGroups).toEqual(expectedReturn);
  });

  it('should not modify the original token group list when calling getTokenGroups method passing a chainId', () => {
    const network = Networks.SEPOLIA;
    const tokenGroupsBefore = structuredClone(tokenGroupList);

    tokensService.getTokenGroups(network);
    expect(tokenGroupList).toEqual(tokenGroupsBefore);
  });
});
