import { SingleChainTokenDTO } from './dtos/single-chain-token-dto';
import { Networks } from './enums/networks';
import { MemoryCache } from './memory-cache';

describe('MemoryCache', () => {
  const sut = new MemoryCache();

  it('should set the passed single chain token in the cache', () => {
    const address = '0x0000000000000000000000000000000000000000';
    const network = Networks.ETHEREUM;

    const expectedObject: SingleChainTokenDTO = {
      address: address,
      decimals: 18,
      name: 'Test Token',
      symbol: 'TEST',
      logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/200x200/26998.png',
    };

    sut.setSingleChainToken(expectedObject, network);

    expect(sut.getSingleChainToken(address, network)).toEqual(expectedObject);
  });
});
