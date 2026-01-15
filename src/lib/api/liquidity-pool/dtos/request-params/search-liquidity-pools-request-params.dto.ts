import { LiquidityPoolType } from '@core/enums/liquidity-pool/liquidity-pool-type';
import { Network } from '@core/enums/network';
import { ILiquidityPoolFilter } from '@core/interfaces/liquidity-pool/liquidity-pool-filter.interface';
import { BlockchainAddress } from '@lib/api/address/blockchain-address.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsDefined, IsOptional, ValidateNested } from 'class-validator';
import { IsBlockchainAddress } from '../../../address/validators/is-blockchain-address.validator';
import { LiquidityPoolSearchConfig } from '../liquiditity-pool-search-config.dto';
import { LiquidityPoolFilter } from '../liquidity-pool-filter.dto';

const LIQUIDITY_POOL_FILTER_DEFAULT_EXAMPLE: ILiquidityPoolFilter = {
  blockedPoolTypes: [LiquidityPoolType.ALGEBRA],
  blockedProtocols: ['sushiswap-v3'],
  minimumTotalValueLockedUsd: 10000,
};

export class SearchLiquidityPoolsRequestParams {
  @ApiProperty({
    description: `
Primary set of token addresses. The search engine returns pools containing at least one of these tokens.

- **Single Token Search:** Provide 'tokensA' and omit 'tokensB'.
- **Pair Search:** Used in conjunction with 'tokensB'.
- **Note:** Token ordering does not affect search results.
    `,
    example: [
      new BlockchainAddress(Network.ETHEREUM, '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'),
      new BlockchainAddress(Network.ETHEREUM, '0x6B175474E89094C44Da98b954EedeAC495271d0F'),
      new BlockchainAddress(Network.BASE, '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'),
    ],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsDefined()
  @Type(() => BlockchainAddress)
  @IsBlockchainAddress({ each: true })
  readonly tokensA!: BlockchainAddress[];

  @ApiPropertyOptional({
    description: `
Secondary set of token identifiers used to narrow the search to specific pairs.

- **Relationship:** Returns pools containing (one token from 'tokensA') AND (one token from 'tokensB').
- **Broad Search:** If omitted, the search returns any pool containing a token from 'tokensA'.
- **Note:** Evaluation is order-independent.
    `,
    example: [
      new BlockchainAddress(Network.ETHEREUM, '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'),
      new BlockchainAddress(Network.BASE, '0x4200000000000000000000000000000000000006'),
    ],
  })
  @IsArray()
  @IsOptional()
  @Type(() => BlockchainAddress)
  @IsBlockchainAddress({ each: true })
  readonly tokensB: BlockchainAddress[] = [];

  @ApiPropertyOptional({
    description: 'Filters based on pool attributes like TVL and protocol types.',
    type: LiquidityPoolFilter,
    example: LIQUIDITY_POOL_FILTER_DEFAULT_EXAMPLE,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LiquidityPoolFilter)
  readonly filters: LiquidityPoolFilter = new LiquidityPoolFilter();

  @ApiPropertyOptional({
    description: 'Configuration for the search such as limit, cursor, etc.',
    type: LiquidityPoolSearchConfig,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LiquidityPoolSearchConfig)
  readonly config: LiquidityPoolSearchConfig = new LiquidityPoolSearchConfig();
}
