import { ChainId } from '@core/enums/chain-id';
import { BasketId } from '@core/enums/token/basket-id.enum';
import { TransformNumberArray, TransformStringArray } from '@lib/api/common/transformers/query-array.transformer';
import { isSupportedChainId } from '@lib/api/network/validators/is-supported-chain-id.validator';
import { isSupportedBasketId } from '@lib/api/token/validators/is-supported-basket-id.validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';

export class GetTokenBasketsListQueryParams {
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

  @ApiPropertyOptional({
    description: 'Filter results to specific baskets by ID. If omitted, all available baskets will be returned.',
    example: [BasketId.USD_STABLECOINS, BasketId.ETH_PEGGED_TOKENS],
    enum: BasketId,
    isArray: true,
  })
  @TransformStringArray()
  @IsOptional()
  @IsArray()
  @isSupportedBasketId({ each: true })
  readonly basketIds?: BasketId[];
}
