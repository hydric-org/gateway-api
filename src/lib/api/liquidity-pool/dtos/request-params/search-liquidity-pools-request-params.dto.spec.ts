import { ChainId } from '@core/enums/chain-id';
import { BasketId } from '@core/enums/token/basket-id.enum';
import { BlockchainAddress } from '@lib/api/address/blockchain-address.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BlockchainBasket } from '../blockchain-basket.dto';
import { SearchLiquidityPoolsRequestParams } from './search-liquidity-pools-request-params.dto';

describe('SearchLiquidityPoolsRequestParams DTO', () => {
  const validToken = new BlockchainAddress(ChainId.ETHEREUM, '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48');

  const validBasket: BlockchainBasket = {
    basketId: BasketId.USD_STABLECOINS,
    chainIds: [ChainId.ETHEREUM],
  };

  it('1. should pass with only tokensA (existing behavior)', async () => {
    const input = {
      tokensA: [validToken],
    };
    const dto = plainToInstance(SearchLiquidityPoolsRequestParams, input);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('2. should pass with only basketsA', async () => {
    const input = {
      basketsA: [validBasket],
    };
    const dto = plainToInstance(SearchLiquidityPoolsRequestParams, input);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('3. should pass with both tokensA and basketsA', async () => {
    const input = {
      tokensA: [validToken],
      basketsA: [validBasket],
    };
    const dto = plainToInstance(SearchLiquidityPoolsRequestParams, input);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('4. should fail when neither tokensA nor basketsA are provided', async () => {
    const input = {};
    const dto = plainToInstance(SearchLiquidityPoolsRequestParams, input);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    // Since class validators attach to the whole object, the property might be empty or the constraint name
    expect(
      errors.find(
        (e) =>
          e.property === '' ||
          e.constraints?.hasTokensOrBaskets ||
          e.property === undefined ||
          e.property === 'SearchLiquidityPoolsRequestParams',
      ),
    ).toBeDefined();
  });

  it('5. should pass with tokensA and basketsB cross', async () => {
    const input = {
      tokensA: [validToken],
      basketsB: [validBasket],
    };
    const dto = plainToInstance(SearchLiquidityPoolsRequestParams, input);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('6. should pass with basketsA and tokensB cross', async () => {
    const input = {
      basketsA: [validBasket],
      tokensB: [validToken],
    };
    const dto = plainToInstance(SearchLiquidityPoolsRequestParams, input);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('7. should pass with baskets-only both sides', async () => {
    const input = {
      basketsA: [validBasket],
      basketsB: [validBasket],
    };
    const dto = plainToInstance(SearchLiquidityPoolsRequestParams, input);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('8. should pass when all four are populated', async () => {
    const input = {
      tokensA: [validToken],
      basketsA: [validBasket],
      tokensB: [validToken],
      basketsB: [validBasket],
    };
    const dto = plainToInstance(SearchLiquidityPoolsRequestParams, input);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('9. should fail with invalid basketId', async () => {
    const input = {
      basketsA: [{ basketId: 'invalid-basket-id' }],
    };
    const dto = plainToInstance(SearchLiquidityPoolsRequestParams, input);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const basketsAError = errors.find((e) => e.property === 'basketsA');
    expect(basketsAError?.children?.[0]?.children?.[0]?.constraints).toHaveProperty('isSupportedBasketId');
  });

  it('10. should fail with invalid chainIds', async () => {
    const input = {
      basketsA: [{ basketId: BasketId.USD_STABLECOINS, chainIds: [99999999] }],
    };
    const dto = plainToInstance(SearchLiquidityPoolsRequestParams, input);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const basketsAError = errors.find((e) => e.property === 'basketsA');
    expect(basketsAError?.children?.[0]?.children?.[0]?.constraints).toHaveProperty('isSupportedChainId');
  });
});
