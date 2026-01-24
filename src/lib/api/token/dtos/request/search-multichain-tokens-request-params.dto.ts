import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { MultiChainTokenListConfig } from '../multi-chain-token-list-config.dto';
import { TokenFilter } from '../token-filter.dto';

export class SearchMultichainTokensRequestParams {
  @ApiProperty({
    description: `
The search term to filter assets. This can be:
- **Ticker Symbol or Name:** (e.g., 'ETH', 'USD', 'Wrapped') — Case-insensitive substring match.
- **Contract Address:** (e.g., '0xC02aa...') — Exact match if a valid Ethereum address format is provided.`,
    examples: ['ETH', '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'],
    minLength: 1,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  readonly search!: string;

  @ApiPropertyOptional({
    description: 'Configuration for the search results such as limit, order, cursor, etc.',
    type: MultiChainTokenListConfig,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => MultiChainTokenListConfig)
  readonly config: MultiChainTokenListConfig = new MultiChainTokenListConfig();

  @ApiPropertyOptional({
    description: 'Additional filters to personalize the search results.',
    type: TokenFilter,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TokenFilter)
  readonly filters: TokenFilter = new TokenFilter();
}
