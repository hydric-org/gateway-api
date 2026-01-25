import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { MultiChainTokenListConfig } from '../multi-chain-token-list-config.dto';
import { SearchTokenFilter } from '../search-token-filter.dto';

export class SearchMultichainTokensRequestParams {
  @ApiProperty({
    description: `
The search term to filter assets by ticker symbol or name.
- **Ticker Symbol or Name:** (e.g., 'ETH', 'USD', 'Wrapped') — Case-insensitive substring match.`,
    example: 'ETH',
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
    type: SearchTokenFilter,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SearchTokenFilter)
  readonly filters: SearchTokenFilter = new SearchTokenFilter();
}
