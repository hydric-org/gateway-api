import sinon from 'sinon';

import { BadRequestException } from '@nestjs/common';
import { ZERO_ETHEREUM_ADDRESS } from 'src/core/constants';
import { MultichainTokenDTO } from 'src/core/dtos/multi-chain-token.dto';
import { SingleChainTokenDTO } from 'src/core/dtos/single-chain-token-dto';
import { TokenGroupDTO } from 'src/core/dtos/token-group.dto';
import { TokenListDTO } from 'src/core/dtos/token-list.dto';
import { TokenPriceDTO } from 'src/core/dtos/token-price-dto';
import { Networks } from 'src/core/enums/networks';
import { TokensController } from './tokens.controller';
import { TokensService } from './tokens.service';

describe('TokensController', () => {
  let sut: TokensController;
  let tokensService: sinon.SinonStubbedInstance<TokensService>;

  beforeEach(() => {
    tokensService = sinon.createStubInstance(TokensService);
    sut = new TokensController(tokensService);
  });

  it(`should return the popular tokens and token groups gotten from the token service passing undefined as the chain id
    when calling /list with no chain id`, () => {
    const expectedPopularTokens: MultichainTokenDTO[] = [
      {
        addresses: {
          [Networks.ETHEREUM]: '0x1',
          [Networks.UNICHAIN]: '0x2',
        } as Record<Networks, string>,
        decimals: {
          [Networks.ETHEREUM]: 18,
          [Networks.UNICHAIN]: 18,
        } as Record<Networks, number>,
        id: '0x1',
        name: '',
        symbol: '',
      },
    ];
    const expectedTokenGroups: TokenGroupDTO[] = [
      {
        id: '0x1',
        name: '',
        tokens: [expectedPopularTokens[0]],
      },
    ];

    tokensService.getPopularTokens.returns(expectedPopularTokens);
    tokensService.getTokenGroups.returns(expectedTokenGroups);

    const result = sut.getTokenList(undefined as unknown as number);

    expect(result).toEqual(<TokenListDTO>{
      popularTokens: expectedPopularTokens,
      tokenGroups: expectedTokenGroups,
    });

    sinon.assert.calledOnceWithExactly(tokensService.getPopularTokens, undefined);
    sinon.assert.calledOnceWithExactly(tokensService.getTokenGroups, undefined);
  });

  it('Should throw when searching cross chain tokens with an address', async () => {
    await expect(async () => await sut.searchTokensCrosschain(ZERO_ETHEREUM_ADDRESS)).rejects.toThrow(
      new BadRequestException(`Searching Cross Chain Tokens by address is not supported`),
    );
  });

  it('should return the tokens got from the tokens service when calling /search/all', async () => {
    const expectedTokens: MultichainTokenDTO[] = [
      {
        addresses: {
          [Networks.ETHEREUM]: '0x1',
          [Networks.UNICHAIN]: '0x2',
        } as Record<Networks, string>,
        decimals: {
          [Networks.ETHEREUM]: 18,
          [Networks.UNICHAIN]: 18,
        } as Record<Networks, number>,
        id: '0x1',
        name: '',
        symbol: '',
      },
    ];

    tokensService.searchTokensByNameOrSymbol.resolves(expectedTokens);

    const result = await sut.searchTokensCrosschain('test');

    expect(result).toEqual(expectedTokens);
  });
  it('should return a single chain token when searching by address on /search/:chainId', async () => {
    const chainId = Networks.ETHEREUM;
    const address = ZERO_ETHEREUM_ADDRESS;
    const expectedToken: SingleChainTokenDTO = {
      address,
      decimals: 18,
      name: 'ETH',
      symbol: 'ETH',
      logoUrl: 'https://logo.url',
    };

    sinon.stub(sut, 'getTokenByAddress').resolves(expectedToken);

    const result = await sut.searchTokensSingleChain(address, chainId);

    expect(result).toEqual([expectedToken]);
    sinon.assert.calledOnceWithExactly(sut.getTokenByAddress as sinon.SinonStub, address, chainId);
  });

  it('should map multichain tokens to single chain tokens when searching by name on /search/:chainId', async () => {
    const chainId = Networks.ETHEREUM;
    const query = 'ETH';
    const multiTokens: MultichainTokenDTO[] = [
      {
        addresses: { [chainId]: '0x1' } as Record<Networks, string>,
        decimals: { [chainId]: 18 } as Record<Networks, number>,
        name: 'Ethereum',
        id: '0x1',
        symbol: 'ETH',
        logoUrl: 'logo',
      },
    ];

    tokensService.searchTokensByNameOrSymbol.returns(multiTokens);

    const result = await sut.searchTokensSingleChain(query, chainId);

    expect(result).toEqual([
      {
        address: '0x1',
        decimals: 18,
        name: 'Ethereum',
        symbol: 'ETH',
        logoUrl: 'logo',
      },
    ]);
    sinon.assert.calledOnceWithExactly(tokensService.searchTokensByNameOrSymbol, query, chainId);
  });

  it('should call tokensService.getTokenByAddress with chainId and address when calling /:address/:chainId', async () => {
    const address = '0xabc';
    const chainId = Networks.UNICHAIN;
    const expectedToken = { address, name: 'TOKEN', symbol: 'TK', decimals: 18 };

    tokensService.getTokenByAddress.resolves(expectedToken);

    const result = await sut.getTokenByAddress(address, chainId);

    expect(result).toEqual(expectedToken);
    sinon.assert.calledOnceWithExactly(tokensService.getTokenByAddress, chainId, address);
  });

  it('should return wrapped native price when usdPrice is 0 and address is zero ethereum address', async () => {
    const address = ZERO_ETHEREUM_ADDRESS;
    const chainId = Networks.ETHEREUM;
    const zeroPrice: TokenPriceDTO = { usdPrice: 0, address };
    const wrappedPrice: TokenPriceDTO = { usdPrice: 123, address };

    tokensService.getTokenPrice.onFirstCall().resolves(zeroPrice).onSecondCall().resolves(wrappedPrice);

    const result = await sut.getTokenPrice(address, chainId);

    expect(result).toEqual(wrappedPrice);
    sinon.assert.calledTwice(tokensService.getTokenPrice);
  });

  it('should return token price directly when usdPrice is not zero', async () => {
    const address = '0xdef';
    const chainId = Networks.ETHEREUM;
    const expectedPrice: TokenPriceDTO = { usdPrice: 100, address };

    tokensService.getTokenPrice.resolves(expectedPrice);

    const result = await sut.getTokenPrice(address, chainId);

    expect(result).toEqual(expectedPrice);
    sinon.assert.calledOnceWithExactly(tokensService.getTokenPrice, address, chainId);
  });
});
