import { IsValidTokenId } from '@lib/api/token/validators/is-valid-token-id.validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsDefined, IsOptional, IsString, ValidateNested } from 'class-validator';
import { PoolType } from 'src/core/enums/pool/pool-type';
import { PoolFilterInputDTO } from '../input/pool-filter-input.dto';
import { PoolSearchConfigInputDTO } from '../input/pool-search-config-input.dto';

const POOL_FILTER_DEFAULT_EXAMPLE = {
  blockedPoolTypes: [PoolType.ALGEBRA],
  blockedProtocols: ['sushiswap-v3'],
  minimumTvlUsd: 10000,
};

export class SearchPoolsRequestDTO {
  @ApiProperty({
    description: `
Primary set of token identifiers. The search engine returns pools containing at least one of these tokens.

- **Format:** "chainId-tokenAddress" (e.g., "1-0xa0b86...")
- **Single Token Search:** Provide 'tokensA' and omit 'tokensB'.
- **Pair Search:** Used in conjunction with 'tokensB'.
- **Note:** Token ordering does not affect search results.
    `,
    example: [
      '1-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      '1-0x6B175474E89094C44Da98b954EedeAC495271d0F',
      '8453-0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    ],
    isArray: true,
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsDefined()
  @IsValidTokenId({ each: true })
  readonly tokensA!: string[];

  @ApiPropertyOptional({
    description: `
Secondary set of token identifiers used to narrow the search to specific pairs.

- **Relationship:** Returns pools containing (one token from 'tokensA') AND (one token from 'tokensB').
- **Broad Search:** If omitted, the search returns any pool containing a token from 'tokensA'.
- **Format:** "chainId-tokenAddress".
- **Note:** Evaluation is order-independent.
    `,
    example: ['1-0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', '8453-0x4200000000000000000000000000000000000006'],
    isArray: true,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @IsValidTokenId({ each: true })
  readonly tokensB: string[] = [];

  @ApiPropertyOptional({
    description: 'Filters based on pool attributes like TVL and protocol types.',
    type: PoolFilterInputDTO,
    example: POOL_FILTER_DEFAULT_EXAMPLE,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PoolFilterInputDTO)
  readonly filters: PoolFilterInputDTO = new PoolFilterInputDTO();

  @ApiPropertyOptional({
    description: 'Configuration for the search such as limit, cursor, etc.',
    type: PoolSearchConfigInputDTO,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PoolSearchConfigInputDTO)
  readonly config: PoolSearchConfigInputDTO = new PoolSearchConfigInputDTO();
}
