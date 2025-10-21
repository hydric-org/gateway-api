import 'reflect-metadata';
import sinon from 'sinon';
import { PoolSearchConfigDTO } from 'src/core/dtos/pool-search-config.dto';
import { PoolSearchFiltersDTO } from 'src/core/dtos/pool-search-filters.dto';
import { Networks } from 'src/core/enums/networks';
import { tokenGroupList } from 'src/core/token-group-list';
import { PoolsController } from './pools.controller';
import { PoolsService } from './pools.service';

describe('PoolsController', () => {
  let sut: PoolsController;
  let poolsService: sinon.SinonStubbedInstance<PoolsService>;

  beforeEach(() => {
    poolsService = sinon.createStubInstance(PoolsService);
    sut = new PoolsController(poolsService);
  });

  it('Should call the service to get pools across networks when calling the /pools/all endpoint with the correct params', async () => {
    const token0Id = '12';
    const token1Id = '34';
    const group0Id = undefined;
    const group1Id = undefined;
    const filters = new PoolSearchFiltersDTO();
    const config = new PoolSearchConfigDTO();

    // @ts-expect-error testing that the uses didn't pass any group id
    await sut.searchPoolsAcrossNetworks(token0Id, token1Id, group0Id, group1Id, filters, config);

    sinon.assert.calledOnceWithExactly(poolsService.searchPoolsCrossChain, {
      searchFilters: filters,
      searchConfig: new PoolSearchConfigDTO(),
      token0Ids: [token0Id],
      token1Ids: [token1Id],
    });
  });

  it('Should call the service to get pools across networks when calling the /pools/all with testnet mode true if config is true', async () => {
    const token0Id = '12';
    const token1Id = '34';
    const group0Id = undefined;
    const group1Id = undefined;
    const filters = new PoolSearchFiltersDTO();
    const config: PoolSearchConfigDTO = { testnetMode: true };

    // @ts-expect-error testing that the uses didn't pass any group id
    await sut.searchPoolsAcrossNetworks(token0Id, token1Id, group0Id, group1Id, filters, config);

    sinon.assert.calledOnceWithMatch(poolsService.searchPoolsCrossChain, {
      searchConfig: {
        testnetMode: true,
      },
    });
  });

  it('Should call the service to get pools in a specific network when calling the /pools/:chainId endpoint with the correct params', async () => {
    const token0 = '0x0000000000000000000000000000000000000000';
    const token1 = '0x1111111111111111111111111111111111111111';
    const chainId = Networks.ETHEREUM;

    // @ts-expect-error testing that the user pass only token0 and token1
    await sut.searchPoolsInChain(chainId, token0, token1);

    sinon.assert.calledOnceWithExactly(poolsService.searchPoolsInChain, {
      token0Addresses: [token0],
      token1Addresses: [token1],
      network: chainId,
      searchConfig: new PoolSearchConfigDTO(),
      searchFilters: new PoolSearchFiltersDTO(),
    });
  });

  it('should pass the correct tokens0 and tokens1 when calling the /pools/:chainId endpoint with group0Id and group1Id', async () => {
    const token0 = undefined;
    const token1 = undefined;
    const group0Id = 'group-1';
    const group1Id = 'group-2';
    const chainId = Networks.ETHEREUM;

    const expectedTokens0 = tokenGroupList
      .find((group) => group.id === group0Id)!
      .tokens.map((token) => token.addresses[chainId])
      .filter((tokenAddress) => tokenAddress !== null);

    const expectedTokens1 = tokenGroupList
      .find((group) => group.id === group1Id)!
      .tokens.map((token) => token.addresses[chainId])
      .filter((tokenAddress) => tokenAddress !== null);

    // @ts-expect-error testing that the user doesn't pass token0 and token1
    await sut.searchPoolsInChain(chainId, token0, token1, group0Id, group1Id);

    sinon.assert.calledOnceWithMatch(poolsService.searchPoolsInChain, {
      token0Addresses: expectedTokens0,
      token1Addresses: expectedTokens1,
    });
  });

  it('should pass the correct tokens0 and tokens1 when calling the /pools/:chainId endpoint with group0Id and token1Address', async () => {
    const token0 = undefined;
    const token1 = '0x1111111111111111111111111111111111111111';
    const group0Id = 'group-1';
    const group1Id = undefined;
    const chainId = Networks.ETHEREUM;

    const expectedTokens0 = tokenGroupList
      .find((group) => group.id === group0Id)!
      .tokens.map((token) => token.addresses[chainId])
      .filter((tokenAddress) => tokenAddress !== null);

    const expectedTokens1 = [token1];

    // @ts-expect-error testing that the user doesn't pass token0 and group1Id
    await sut.searchPoolsInChain(chainId, token0, token1, group0Id, group1Id);

    sinon.assert.calledOnceWithMatch(poolsService.searchPoolsInChain, {
      token0Addresses: expectedTokens0,
      token1Addresses: expectedTokens1,
    });
  });

  it('should pass the correct tokens0 and tokens1 when calling the /pools/:chainId endpoint with token0Address and group1Id', async () => {
    const token0 = '0x0000000000000000000000000000000000000000';
    const token1 = undefined;
    const group0Id = undefined;
    const group1Id = 'group-2';
    const chainId = Networks.ETHEREUM;

    const expectedTokens0 = [token0];

    const expectedTokens1 = tokenGroupList
      .find((group) => group.id === group1Id)!
      .tokens.map((token) => token.addresses[chainId])
      .filter((tokenAddress) => tokenAddress !== null);

    // @ts-expect-error testing that the user doesn't pass token1 and group0Id
    await sut.searchPoolsInChain(chainId, token0, token1, group0Id, group1Id);

    sinon.assert.calledOnceWithMatch(poolsService.searchPoolsInChain, {
      token0Addresses: expectedTokens0,
      token1Addresses: expectedTokens1,
    });
  });

  it('should pass the correct tokens0 and tokens1 when calling the /pools/all endpoint with group0Id and group1Id', async () => {
    const token0 = undefined;
    const token1 = undefined;
    const group0Id = 'group-1';
    const group1Id = 'group-2';

    const expectedTokens0 = tokenGroupList.find((group) => group.id === group0Id)!.tokens.map((token) => token.id);
    const expectedTokens1 = tokenGroupList.find((group) => group.id === group1Id)!.tokens.map((token) => token.id);

    // @ts-expect-error testing that the user doesn't pass token0 and token1
    await sut.searchPoolsAcrossNetworks(token0, token1, group0Id, group1Id);

    sinon.assert.calledOnceWithMatch(poolsService.searchPoolsCrossChain, {
      token0Ids: expectedTokens0,
      token1Ids: expectedTokens1,
    });
  });

  it('should pass the correct tokens0 and tokens1 when calling the /pools/all endpoint with group0Id and token1Id', async () => {
    const token0 = undefined;
    const token1 = '2';
    const group0Id = 'group-1';
    const group1Id = undefined;

    const expectedTokens0 = tokenGroupList.find((group) => group.id === group0Id)!.tokens.map((token) => token.id);

    const expectedTokens1 = [token1];

    // @ts-expect-error testing that the user doesn't pass token0 and group1Id
    await sut.searchPoolsAcrossNetworks(token0, token1, group0Id, group1Id);

    sinon.assert.calledOnceWithMatch(poolsService.searchPoolsCrossChain, {
      token0Ids: expectedTokens0,
      token1Ids: expectedTokens1,
    });
  });

  it('should pass the correct tokens0 and tokens1 when calling the /pools/all endpoint with token0Id and group1Id', async () => {
    const token0 = '4';
    const token1 = undefined;
    const group0Id = undefined;
    const group1Id = 'group-3';

    const expectedTokens0 = [token0];
    const expectedTokens1 = tokenGroupList.find((group) => group.id === group1Id)!.tokens.map((token) => token.id);

    // @ts-expect-error testing that the user doesn't pass token1 and group0Id
    await sut.searchPoolsAcrossNetworks(token0, token1, group0Id, group1Id);

    sinon.assert.calledOnceWithMatch(poolsService.searchPoolsCrossChain, {
      token0Ids: expectedTokens0,
      token1Ids: expectedTokens1,
    });
  });

  it('Should pass the correct params to the pool service to get a single pool data when calling /pools/:poolAddress/:chainId', async () => {
    const poolAddress = '0xbbaXabas';
    const chainId = 1;
    const parseWrappedToNative = false;

    await sut.getPoolData(poolAddress, chainId, parseWrappedToNative);

    sinon.assert.calledOnceWithExactly(poolsService.getPoolData, poolAddress, chainId, parseWrappedToNative);
  });

  it(`Should pass the parse wrapped native as native true to pool service when calling
    /pools/:poolAddress/:chainId with parseWrappedToNative true`, async () => {
    const poolAddress = '0xbbaXabas';
    const chainId = 1;

    await sut.getPoolData(poolAddress, chainId, true);

    sinon.assert.calledOnceWithMatch(poolsService.getPoolData, sinon.match.any, sinon.match.any, true);
  });

  it(`Should pass the parse wrapped native as native false to pool service when calling
    /pools/:poolAddress/:chainId with parseWrappedToNative false`, async () => {
    const poolAddress = '0xbbaXabas';
    const chainId = 1;

    await sut.getPoolData(poolAddress, chainId, false);

    sinon.assert.calledOnceWithMatch(poolsService.getPoolData, sinon.match.any, sinon.match.any, false);
  });
});
