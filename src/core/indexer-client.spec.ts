import { InternalServerErrorException } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';
import sinon from 'sinon';
import {
  GetPoolsDocument,
  GetPoolsQuery,
  GetPoolsQuery_query_root_Pool_Pool,
  GetPoolsQueryVariables,
  GetProtocolsDocument,
  GetProtocolsQuery,
  GetTokenDocument,
  GetTokenQuery,
  GetTokenQuery_query_root_Token_Token,
} from 'src/gen/graphql.gen';

import { PoolSearchFiltersDTO } from './dtos/pool-search-filters.dto';
import { Networks, NetworksUtils } from './enums/networks';
import { PoolType } from './enums/pool-type';
import { IndexerClient } from './indexer-client';
import { getPoolIntervalQueryFilters } from './utils/query-utils';

describe('IndexerClient', () => {
  let sut: IndexerClient;
  let indexerClient: GraphQLClient & { request: sinon.SinonStub };
  const defaultPoolQueryResponse = (params: { customId?: string }): GetPoolsQuery_query_root_Pool_Pool => ({
    chainId: 1,
    createdAtTimestamp: '1',
    currentFeeTier: 1,
    dailyData: [],
    hourlyData: [],
    initialFeeTier: 1,
    poolAddress: params.customId ?? `pool-address`,
    poolType: 'V3',
    positionManager: `position-manager-address`,
    totalValueLockedUSD: '1',
  });

  beforeEach(() => {
    indexerClient = sinon.createStubInstance(GraphQLClient);
    indexerClient.request.withArgs(GetPoolsDocument).resolves(<GetPoolsQuery>{
      Pool: [defaultPoolQueryResponse({})],
    });

    const graphQLClients = {
      indexerClient,
    };

    sut = new IndexerClient(graphQLClients);
  });

  afterEach(() => {
    sinon.restore();
  });

  it(`should request the graphQLIndexer Client to get all protocols when calling 'queryAllProtocols'
    and return all the protocols from the response`, async () => {
    const protocols: GetProtocolsQuery = {
      Protocol: Array.from({ length: 10 }).map((_, index) => ({
        id: `protocol-${index}`,
        name: `name-${index}`,
        url: `url-${index}`,
        logo: `logo-${index}`,
      })),
    };

    indexerClient.request.resolves(protocols);
    const queryResponse = await sut.queryAllProtocols();

    expect(queryResponse).toEqual(protocols.Protocol);

    sinon.assert.calledOnceWithExactly(indexerClient.request, GetProtocolsDocument);
  });

  it(`should request to query single token filtering for the token id built from
     the chain id and the token address when calling 'querySingleToken' and return
     the first token from the response`, async () => {
    const chainId = 1;
    const tokenAddress = '0x2121';
    const expectedToken: GetTokenQuery_query_root_Token_Token = {
      id: `${chainId}-${tokenAddress}`,
      name: 'Xabas',
      symbol: 'Sabax',
      usdPrice: '2121',
      decimals: 18,
    };

    const tokensResponse: GetTokenQuery = {
      Token: [
        expectedToken,
        {
          id: 'Lulala',
          decimals: 16,
          name: '111',
          symbol: '111',
          usdPrice: '9999',
        },
      ],
    };

    indexerClient.request.resolves(tokensResponse);

    const queryResponse = await sut.querySingleToken(chainId, tokenAddress);
    expect(queryResponse).toEqual(expectedToken);

    sinon.assert.calledOnceWithExactly(indexerClient.request, GetTokenDocument, {
      tokenFilter: {
        id: {
          _in: [`${chainId}-${tokenAddress}`.toLowerCase()],
        },
      },
    });
  });

  it(`should request to query single token adding the wrapped native address also
    when calling 'querySingleToken' with zero address`, async () => {
    const chainId = 1;
    const tokenAddress = '0x0000000000000000000000000000000000000000';
    const expectedToken: GetTokenQuery_query_root_Token_Token = {
      id: `${chainId}-${tokenAddress}`,
      name: 'Xabas',
      symbol: 'Sabax',
      usdPrice: '2121',
      decimals: 18,
    };

    const tokensResponse: GetTokenQuery = {
      Token: [
        expectedToken,
        {
          id: 'Lulala',
          decimals: 16,
          name: '111',
          symbol: '111',
          usdPrice: '9999',
        },
      ],
    };

    indexerClient.request.resolves(tokensResponse);

    const queryResponse = await sut.querySingleToken(chainId, tokenAddress);
    expect(queryResponse).toEqual(expectedToken);

    sinon.assert.calledOnceWithExactly(indexerClient.request, GetTokenDocument, {
      tokenFilter: {
        id: {
          _in: [
            `${chainId}-${tokenAddress}`.toLowerCase(),
            `${chainId}-${NetworksUtils.wrappedNativeAddress(chainId)}`,
          ],
        },
      },
    });
  });

  it(`should throw internal server exception saying that the token was not found when calling 'querySingleToken'
    and the response return no tokens in the list`, async () => {
    const chainId = 1;
    const tokenAddress = '0x0000000000000000000000000000000000000000';

    const tokensResponse: GetTokenQuery = {
      Token: [],
    };

    indexerClient.request.resolves(tokensResponse);

    await expect(async () => await sut.querySingleToken(chainId, tokenAddress)).rejects.toThrow(
      new InternalServerErrorException(
        `Token '${tokenAddress}' at '${chainId} chain' not found; maybe incorrect address or chain?`,
      ),
    );
  });

  it(`should request the indexer client to get a single pool passing the id in the filters, based on the pool address
    and the chain id sent, when calling 'querySinglePool' and return the first pool from the response`, async () => {
    const poolAddress = '0x0000000000000000000000000000000000000000';
    const chainId = 1;

    const poolsResponse: GetPoolsQuery = {
      Pool: Array.from({ length: 10 }).map((_, index) =>
        defaultPoolQueryResponse({
          customId: `pool-${index}`,
        }),
      ),
    };

    indexerClient.request.withArgs(GetPoolsDocument).resolves(poolsResponse);

    const queryResponse = await sut.querySinglePool(poolAddress, chainId);
    expect(queryResponse).toEqual(poolsResponse.Pool[0]);

    sinon.assert.calledOnceWithMatch(indexerClient.request, GetPoolsDocument, <GetPoolsQueryVariables>{
      poolsFilter: {
        id: {
          _eq: `${chainId}-${poolAddress}`.toLowerCase(),
        },
      },
    });
  });

  it(`should request the indexer client to get a single pool passing the filters to calculate
    the pool yields correctly when calling 'querySinglePool' with a min interval TVL of 1000
    to cut out yield outliers due to low TVL`, async () => {
    const poolAddress = '0x0000000000000000000000000000000000000000';
    const chainId = 1;

    const poolsResponse: GetPoolsQuery = {
      Pool: Array.from({ length: 10 }).map((_, index) =>
        defaultPoolQueryResponse({
          customId: `pool-${index}`,
        }),
      ),
    };

    indexerClient.request.resolves(poolsResponse);
    await sut.querySinglePool(poolAddress, chainId);

    sinon.assert.calledOnceWithMatch(indexerClient.request, GetPoolsDocument, <GetPoolsQueryVariables>{
      ...getPoolIntervalQueryFilters({ minIntervalTVL: 1000 }),
    });
  });

  it("should throw internal server exception when calling 'querySinglePool' and the response return no pools in the list", async () => {
    const poolAddress = '0x0000000000000000000000000000000000000000';
    const chainId = 1;

    const poolsResponse: GetPoolsQuery = {
      Pool: [],
    };

    indexerClient.request.withArgs(GetPoolsDocument).resolves(poolsResponse);

    await expect(async () => await sut.querySinglePool(poolAddress, chainId)).rejects.toThrow(
      new InternalServerErrorException(
        `Pool '${poolAddress}' at '${chainId} chain' not found; maybe incorrect address or chain?`,
      ),
    );
  });

  it(`should pass the min tvl usd from the search filters passed, to the total value locked usd
    pool filter in the request when calling 'queryPoolsForPair'`, async () => {
    const searchFilters: PoolSearchFiltersDTO = {
      ...new PoolSearchFiltersDTO(),
      minimumTvlUsd: 9998,
    };

    await sut.queryPoolsForPairs({
      token0AddressesPerChainId: {
        1: new Set(['0x0000000000000000000000000000000000000000']),
      },
      token1AddressesPerChainId: {
        1: new Set(['0x0000000000000000000000000000000000000000']),
      },
      searchFilters,
    });

    sinon.assert.calledOnceWithMatch(indexerClient.request, GetPoolsDocument, <GetPoolsQueryVariables>{
      poolsFilter: {
        totalValueLockedUSD: {
          _gt: searchFilters.minimumTvlUsd.toString(),
        },
      },
    });
  });

  it(`should pass the blocked protocols ids from the filter to the indexer request to not allow
    pools from the protocols ids, when calling 'queryPoolsForPair'`, async () => {
    const searchFilters: PoolSearchFiltersDTO = {
      ...new PoolSearchFiltersDTO(),
      blockedProtocols: ['protocol-1', 'protocol-2', 'protocol-3'],
    };

    await sut.queryPoolsForPairs({
      token0AddressesPerChainId: {
        1: new Set(['0x0000000000000000000000000000000000000000']),
      },
      token1AddressesPerChainId: {
        1: new Set(['0x0000000000000000000000000000000000000000']),
      },
      searchFilters,
    });

    sinon.assert.calledOnceWithMatch(indexerClient.request, GetPoolsDocument, <GetPoolsQueryVariables>{
      poolsFilter: {
        protocol_id: {
          _nin: searchFilters.blockedProtocols,
        },
      },
    });
  });

  it(`should pass the protocol id filter as empty when there are no blocked protocols, when calling 'queryPoolsForPair'`, async () => {
    const searchFilters: PoolSearchFiltersDTO = {
      ...new PoolSearchFiltersDTO(),
      blockedProtocols: [],
    };

    await sut.queryPoolsForPairs({
      token0AddressesPerChainId: {
        1: new Set(['0x0000000000000000000000000000000000000000']),
      },
      token1AddressesPerChainId: {
        1: new Set(['0x0000000000000000000000000000000000000000']),
      },
      searchFilters,
    });

    sinon.assert.calledOnceWithMatch(indexerClient.request, GetPoolsDocument, <GetPoolsQueryVariables>{
      poolsFilter: {
        protocol_id: {
          _nin: [],
        },
      },
    });
  });

  it(`should pass the blocked pool types from the filter to the indexer request to not allow
    pools with the pool types, when calling 'queryPoolsForPair'`, async () => {
    const searchFilters: PoolSearchFiltersDTO = {
      ...new PoolSearchFiltersDTO(),
      blockedPoolTypes: [PoolType.V3],
    };

    await sut.queryPoolsForPairs({
      token0AddressesPerChainId: {
        1: new Set(['0x0000000000000000000000000000000000000000']),
      },
      token1AddressesPerChainId: {
        1: new Set(['0x0000000000000000000000000000000000000000']),
      },
      searchFilters,
    });

    sinon.assert.calledOnceWithMatch(indexerClient.request, GetPoolsDocument, <GetPoolsQueryVariables>{
      poolsFilter: {
        poolType: {
          _nin: searchFilters.blockedPoolTypes,
        },
      },
    });
  });

  it(`should pass the pool type filter as empty when there are no blocked pool types, when calling 'queryPoolsForPair'`, async () => {
    const searchFilters: PoolSearchFiltersDTO = {
      ...new PoolSearchFiltersDTO(),
      blockedPoolTypes: [],
    };

    await sut.queryPoolsForPairs({
      token0AddressesPerChainId: {
        1: new Set(['0x0000000000000000000000000000000000000000']),
      },
      token1AddressesPerChainId: {
        1: new Set(['0x0000000000000000000000000000000000000000']),
      },
      searchFilters,
    });

    sinon.assert.calledOnceWithMatch(indexerClient.request, GetPoolsDocument, <GetPoolsQueryVariables>{
      poolsFilter: {
        poolType: {
          _nin: [],
        },
      },
    });
  });

  it(`Should build the token0 ids and token1 ids derived from the passed tokens per chain id
    and pass them to separate indexer requests (one per chain) matching tokens zero with ones and ones with zeros`, async () => {
    const tokens0AddressesPerChainId: Record<number, Set<string>> = {
      [Networks.ETHEREUM]: new Set(['0xEth1', '0xEth2']),
      [Networks.UNICHAIN]: new Set(['0xUni1', '0xUni2']),
      [Networks.BASE]: new Set(['0xBase1', '0xBase2']),
    };

    const tokens1AddressesPerChainId: Record<number, Set<string>> = {
      [Networks.ETHEREUM]: new Set(['0xEth3', '0xEth4']),
      [Networks.UNICHAIN]: new Set(['0xUni3', '0xUni4']),
      [Networks.BASE]: new Set(['0xBase3', '0xBase4']),
    };

    const expectedEthIds0 = [`${Networks.ETHEREUM}-0xeth1`, `${Networks.ETHEREUM}-0xeth2`];
    const expectedEthIds1 = [`${Networks.ETHEREUM}-0xeth3`, `${Networks.ETHEREUM}-0xeth4`];

    const expectedUniIds0 = [`${Networks.UNICHAIN}-0xuni1`, `${Networks.UNICHAIN}-0xuni2`];
    const expectedUniIds1 = [`${Networks.UNICHAIN}-0xuni3`, `${Networks.UNICHAIN}-0xuni4`];

    const expectedBaseIds0 = [`${Networks.BASE}-0xbase1`, `${Networks.BASE}-0xbase2`];
    const expectedBaseIds1 = [`${Networks.BASE}-0xbase3`, `${Networks.BASE}-0xbase4`];

    await sut.queryPoolsForPairs({
      token0AddressesPerChainId: tokens0AddressesPerChainId,
      token1AddressesPerChainId: tokens1AddressesPerChainId,
      searchFilters: new PoolSearchFiltersDTO(),
    });

    // Check Ethereum Call
    sinon.assert.calledWithMatch(indexerClient.request, GetPoolsDocument, {
      poolsFilter: {
        _or: [
          {
            token0_id: { _in: expectedEthIds0 },
            token1_id: { _in: expectedEthIds1 },
          },
          {
            token0_id: { _in: expectedEthIds1 },
            token1_id: { _in: expectedEthIds0 },
          },
        ],
      },
    });

    // Check Unichain Call
    sinon.assert.calledWithMatch(indexerClient.request, GetPoolsDocument, {
      poolsFilter: {
        _or: [
          {
            token0_id: { _in: expectedUniIds0 },
            token1_id: { _in: expectedUniIds1 },
          },
          {
            token0_id: { _in: expectedUniIds1 },
            token1_id: { _in: expectedUniIds0 },
          },
        ],
      },
    });

    // Check Base Call
    sinon.assert.calledWithMatch(indexerClient.request, GetPoolsDocument, {
      poolsFilter: {
        _or: [
          {
            token0_id: { _in: expectedBaseIds0 },
            token1_id: { _in: expectedBaseIds1 },
          },
          {
            token0_id: { _in: expectedBaseIds1 },
            token1_id: { _in: expectedBaseIds0 },
          },
        ],
      },
    });
  });

  it(`it should pass thr filters for the intervals when calling 'queryPoolsForPair', passing the min
    tvl usd for the interval as the one in the search filter`, async () => {
    const searchFilters: PoolSearchFiltersDTO = {
      ...new PoolSearchFiltersDTO(),
      minimumTvlUsd: 8781,
    };

    await sut.queryPoolsForPairs({
      token0AddressesPerChainId: {
        1: new Set(['0x0000000000000000000000000000000000000000']),
      },
      token1AddressesPerChainId: {
        1: new Set(['0x0000000000000000000000000000000000000000']),
      },
      searchFilters,
    });

    sinon.assert.calledOnceWithMatch(indexerClient.request, GetPoolsDocument, <GetPoolsQueryVariables>{
      ...getPoolIntervalQueryFilters({
        minIntervalTVL: searchFilters.minimumTvlUsd,
      }),
    });
  });

  it("should return the raw response from the indexer request when calling 'queryPoolsForPair'", async () => {
    const expectedResult = defaultPoolQueryResponse({
      customId: 'xabas-21-pool-address',
    });

    indexerClient.request.withArgs(GetPoolsDocument).resolves(<GetPoolsQuery>{
      Pool: [expectedResult],
    });

    const poolsQueryResponse = await sut.queryPoolsForPairs({
      token0AddressesPerChainId: {
        1: new Set(['0x0000000000000000000000000000000000000000']),
      },
      token1AddressesPerChainId: {
        1: new Set(['0x0000000000000000000000000000000000000000']),
      },
      searchFilters: new PoolSearchFiltersDTO(),
    });

    expect(poolsQueryResponse).toEqual([expectedResult]);
  });
});
