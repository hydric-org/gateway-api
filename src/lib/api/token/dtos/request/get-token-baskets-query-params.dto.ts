import { ChainId } from '@core/enums/chain-id';
import { TransformNumberArray } from '@lib/api/common/transformers/query-array.transformer';
import { isSupportedChainId } from '@lib/api/network/validators/is-supported-chain-id.validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';

export class GetMultipleChainsTokenBasketsQueryParams {
  @ApiPropertyOptional({
    description:
      'Filter results to specific networks by chain ID. If omitted, all supported networks will be returned.',
    example: [ChainId.ETHEREUM, ChainId.BASE],
    enum: ChainId,
    isArray: true,
  })
  @TransformNumberArray()
  @IsOptional()
  @IsArray()
  @isSupportedChainId({ each: true })
  readonly chainIds?: ChainId[];
}
