import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { SingleChainTokenListConfig } from '../single-chain-token-list-config.dto';
import { SingleChainTokenSearchFilter } from '../single-chain-token-search-filter.dto';

export class SearchSingleChainTokensRequestBody {
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
    type: SingleChainTokenListConfig,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SingleChainTokenListConfig)
  readonly config: SingleChainTokenListConfig = new SingleChainTokenListConfig();

  @ApiPropertyOptional({
    description: 'Additional filters to personalize the search results.',
    type: SingleChainTokenSearchFilter,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SingleChainTokenSearchFilter)
  readonly filters: SingleChainTokenSearchFilter = new SingleChainTokenSearchFilter();
}
