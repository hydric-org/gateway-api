import { ChainId } from '@core/enums/chain-id';
import { BlockchainAddress } from '@lib/api/address/blockchain-address.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { IsBlockchainAddress } from '../../../address/validators/is-blockchain-address.validator';
import { HasTokensOrBaskets } from '../../validators/has-tokens-or-baskets.validator';
import { BlockchainBasket } from '../blockchain-basket.dto';
import { LiquidityPoolSearchConfig } from '../liquiditity-pool-search-config.dto';
import { SearchLiquidityPoolsFilter } from '../search-liquidity-pools-filter.dto';

const LIQUIDITY_POOL_FILTER_DEFAULT_EXAMPLE: SearchLiquidityPoolsFilter = {
  minimumTotalValueLockedUsd: 10000,
  blockedPoolTypes: [],
  blockedProtocols: [],
  protocols: [],
  poolTypes: [],
};

@HasTokensOrBaskets()
export class SearchLiquidityPoolsRequestParams {
  @ApiPropertyOptional({
    description: `
Primary set of token addresses. The search engine returns pools containing at least one of these tokens.

- **Single Token Search:** Provide 'tokensA' and omit 'tokensB' (or alternatively use 'basketsA').
- **Pair Search:** Used in conjunction with 'tokensB' or 'basketsB'.
- **Note:** Token ordering does not affect search results.
    `,
    example: [
      new BlockchainAddress(ChainId.ETHEREUM, '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'),
      new BlockchainAddress(ChainId.ETHEREUM, '0x6B175474E89094C44Da98b954EedeAC495271d0F'),
      new BlockchainAddress(ChainId.BASE, '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'),
    ],
    type: [BlockchainAddress],
  })
  @IsArray()
  @IsOptional()
  @Type(() => BlockchainAddress)
  @IsBlockchainAddress({ each: true })
  readonly tokensA: BlockchainAddress[] = [];

  @ApiPropertyOptional({
    description: `
Primary set of token baskets. The search engine automatically resolves these baskets into tokens server-side.
Returns pools containing at least one token from any of the provided baskets.

- **Behaviour:** This joins with tokensA, so if you pass tokensA and basketsA, the search engine will return pools containing at least one token from tokensA OR at least one token from basketsA.
- **Note:** Either 'tokensA' or 'basketsA' must be provided.
    `,
    type: [BlockchainBasket],
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BlockchainBasket)
  readonly basketsA: BlockchainBasket[] = [];

  @ApiPropertyOptional({
    description: `
Secondary set of token identifiers used to narrow the search to specific pairs.

- **Relationship:** Returns pools containing (one token from 'tokensA'/'basketsA') AND (one token from 'tokensB'/'basketsB').
- **Broad Search:** If omitted, the search returns any pool containing a token from 'tokensA'/'basketsA'.
- **Note:** Evaluation is order-independent.
    `,
    example: [
      new BlockchainAddress(ChainId.ETHEREUM, '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'),
      new BlockchainAddress(ChainId.BASE, '0x4200000000000000000000000000000000000006'),
    ],
    type: [BlockchainAddress],
  })
  @IsArray()
  @IsOptional()
  @Type(() => BlockchainAddress)
  @IsBlockchainAddress({ each: true })
  readonly tokensB: BlockchainAddress[] = [];

  @ApiPropertyOptional({
    description: `
Secondary set of token baskets used to narrow the search to specific pairs. This cannot be used alone, needs either tokensA or basketsA.

- **Relationship:** Returns pools that contain at least one token from 'tokensA'/'basketsA' AND at least one token from 'tokensB'/'basketsB'.
    `,
    type: [BlockchainBasket],
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BlockchainBasket)
  readonly basketsB: BlockchainBasket[] = [];

  @ApiPropertyOptional({
    description: 'Filters based on pool attributes like TVL and protocol types.',
    type: SearchLiquidityPoolsFilter,
    example: LIQUIDITY_POOL_FILTER_DEFAULT_EXAMPLE,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SearchLiquidityPoolsFilter)
  readonly filters: SearchLiquidityPoolsFilter = new SearchLiquidityPoolsFilter();

  @ApiPropertyOptional({
    description: 'Configuration for the search such as limit, cursor, etc.',
    type: LiquidityPoolSearchConfig,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LiquidityPoolSearchConfig)
  readonly config: LiquidityPoolSearchConfig = new LiquidityPoolSearchConfig();
}
