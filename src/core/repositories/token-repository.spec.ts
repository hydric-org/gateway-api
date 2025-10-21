import sinon from 'sinon';
import 'src/core/extensions/string.extension';
import { SingleChainTokenDTO } from '../dtos/single-chain-token-dto';
import { Networks } from '../enums/networks';
import { IndexerClient } from '../indexer-client';
import { MemoryCache } from '../memory-cache';
import { tokenList } from '../token-list';
import { TokenRepository } from './token-repository';

describe('TokenRepository', () => {
  let sut: TokenRepository;
  let indexerClient: sinon.SinonStubbedInstance<IndexerClient>;
  let memoryCache: sinon.SinonStubbedInstance<MemoryCache>;

  beforeEach(() => {
    indexerClient = sinon.createStubInstance(IndexerClient);
    memoryCache = sinon.createStubInstance(MemoryCache);

    sut = new TokenRepository(indexerClient, memoryCache);

    indexerClient.querySingleToken.resolves({
      decimals: 18,
      id: 'toko-1',
      name: 'SOME TOKO',
      symbol: 'STKO',
      usdPrice: '1050',
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it(`should return a cached token in the memory cache
    if calling 'getTokenByAddress' passing to use cache`, async () => {
    const network = Networks.ETHEREUM;
    const tokenAddress = '0xToko';

    const expectedCachedToken: SingleChainTokenDTO = {
      address: tokenAddress,
      decimals: 18,
      name: 'CACHED TOKO',
      symbol: 'CTKO',
      logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/200x200/26998.png',
    };

    memoryCache.getSingleChainToken.returns(expectedCachedToken);

    const token = await sut.getTokenByAddress(network, tokenAddress, {
      useCache: true,
    });

    expect(token).toEqual(expectedCachedToken);

    sinon.assert.calledOnceWithExactly(memoryCache.getSingleChainToken, tokenAddress, network);
    sinon.assert.notCalled(indexerClient.querySingleToken);
  });

  it(`should request the indexer to get a token when calling 'getTokenByAddress'
    passing to use cache, but the cache does not have the token`, async () => {
    const network = Networks.ETHEREUM;
    const tokenAddress = '0xToko';

    const expectedToken: SingleChainTokenDTO = {
      address: tokenAddress,
      decimals: 18,
      name: 'INDEXED TOKO',
      symbol: 'ITKO',
    };

    memoryCache.getSingleChainToken.returns(undefined);
    indexerClient.querySingleToken.resolves({
      decimals: expectedToken.decimals,
      id: expectedToken.address,
      name: expectedToken.name,
      symbol: expectedToken.symbol,
      usdPrice: '0',
    });

    const token = await sut.getTokenByAddress(network, tokenAddress, {
      useCache: true,
    });

    expect(token).toEqual(expectedToken);
    sinon.assert.calledOnceWithExactly(indexerClient.querySingleToken, network, tokenAddress);
  });

  it(`should store the token in the cache after using the indexer to get it`, async () => {
    const network = Networks.ETHEREUM;
    const tokenAddress = '0xToko';

    const expectedToken: SingleChainTokenDTO = {
      address: tokenAddress,
      decimals: 18,
      name: 'TOKO INDEXED',
      symbol: 'I TKO I',
    };

    indexerClient.querySingleToken.resolves({
      decimals: expectedToken.decimals,
      id: expectedToken.address,
      name: expectedToken.name,
      symbol: expectedToken.symbol,
      usdPrice: '111',
    });

    await sut.getTokenByAddress(network, tokenAddress);
    sinon.assert.calledOnceWithExactly(memoryCache.setSingleChainToken, expectedToken, network);
  });

  it(`should not request the memory to get the cached token when calling 'getTokenByAddress'
    passing to not use cache`, async () => {
    const network = Networks.ETHEREUM;
    const tokenAddress = '0xToko';

    await sut.getTokenByAddress(network, tokenAddress, {
      useCache: false,
    });

    sinon.assert.notCalled(memoryCache.getSingleChainToken);
  });

  it(`should use the internal token list when calling getTokenByAddress with
    an address present there and not request the indexer`, async () => {
    const network = Networks.ETHEREUM;
    const tokenAddress = tokenList[0].addresses[network]!;

    const expectedToken: SingleChainTokenDTO = {
      address: tokenAddress,
      logoUrl: tokenList[0].logoUrl,
      decimals: tokenList[0].decimals[network]!,
      name: tokenList[0].name,
      symbol: tokenList[0].symbol,
    };

    const token = await sut.getTokenByAddress(network, tokenAddress);

    expect(token).toEqual(expectedToken);

    sinon.assert.notCalled(indexerClient.querySingleToken);
    sinon.assert.calledOnceWithExactly(memoryCache.setSingleChainToken, expectedToken, network);
  });

  it(`should make many requests to 'getTokenByAddress', all of them using cache if available
    when calling 'getManyTokensFromManyNetworks' and return the tokens got by network and address`, async () => {
    const getTokenByAddressStub = sinon.stub(sut, 'getTokenByAddress');

    const addressesPerNetwork: Record<number, Set<string>> = {
      [Networks.ETHEREUM]: new Set(['0xToken1', '0xToken2']),
      [Networks.SEPOLIA]: new Set(['0xToken3', '0xToken4']),
      [Networks.BASE]: new Set(['0xToken5']),
    };

    const expectedResult: Record<number, Record<string, SingleChainTokenDTO>> = {
      [Networks.ETHEREUM]: {
        '0xToken1': {
          address: '0xToken1',
          decimals: 18,
          name: 'Toke1',
          symbol: 'TKO1',
          logoUrl: '22',
        },
        '0xToken2': {
          address: '0xToken2',
          decimals: 18,
          name: 'Toke2',
          symbol: 'TKO2',
          logoUrl: '23',
        },
      },
      [Networks.SEPOLIA]: {
        '0xToken3': {
          address: '0xToken3',
          decimals: 18,
          name: 'TOKe3',
          symbol: 'TKO3',
          logoUrl: '20',
        },
        '0xToken4': {
          address: '0xToken4',
          decimals: 18,
          name: 'TOKe4',
          symbol: 'TKO4',
          logoUrl: '19',
        },
      },
      [Networks.BASE]: {
        '0xToken5': {
          address: '0xToken5',
          decimals: 18,
          name: 'TOKe',
          symbol: 'TKO',
          logoUrl: '21',
        },
      },
    };

    Object.keys(addressesPerNetwork).forEach((network) => {
      addressesPerNetwork[Number(network)].forEach((address) => {
        getTokenByAddressStub
          .withArgs(Number(network), address, { useCache: true })
          .resolves(expectedResult[Number(network)][address]);
      });
    });

    const tokens = await sut.getManyTokensFromManyNetworks(addressesPerNetwork);
    expect(tokens).toEqual(expectedResult);

    Object.keys(addressesPerNetwork).forEach((network) => {
      addressesPerNetwork[Number(network)].forEach((address) => {
        sinon.assert.calledWithExactly(getTokenByAddressStub, Number(network), address, { useCache: true });
      });
    });
  });
});
