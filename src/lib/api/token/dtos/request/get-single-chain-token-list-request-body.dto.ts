import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { SingleChainTokenListConfig } from '../single-chain-token-list-config.dto';
import { SingleChainTokenListFilter } from '../single-chain-token-list-filter.dto';

export class GetSingleChainTokenListRequestBody {
  @ApiPropertyOptional({
    description: 'Configuration for the token list request such as limit, order, cursor, etc.',
    type: SingleChainTokenListConfig,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SingleChainTokenListConfig)
  readonly config: SingleChainTokenListConfig = new SingleChainTokenListConfig();

  @ApiPropertyOptional({
    description: 'Filters for the token list request to personalize the response.',
    type: SingleChainTokenListFilter,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SingleChainTokenListFilter)
  readonly filters: SingleChainTokenListFilter = new SingleChainTokenListFilter();
}
