import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { MultiChainTokenListConfig } from '../multi-chain-token-list-config.dto';
import { TokenFilter } from '../token-filter.dto';

export class GetMultiChainTokenListRequestParams {
  @ApiPropertyOptional({
    description: 'Configuration for the token list request such as limit, order, cursor, etc.',
    type: MultiChainTokenListConfig,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => MultiChainTokenListConfig)
  readonly config: MultiChainTokenListConfig = new MultiChainTokenListConfig();

  @ApiPropertyOptional({
    description: 'Filters for the token list request to personalize the response.',
    type: TokenFilter,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TokenFilter)
  readonly filters: TokenFilter = new TokenFilter();
}
