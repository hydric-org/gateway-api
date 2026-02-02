import { LiquidityPoolType } from '@core/enums/liquidity-pool/liquidity-pool-type';
import { ILiquidityPoolFilter } from '@core/interfaces/liquidity-pool/liquidity-pool-filter.interface';
import { IsProtocolId } from '@lib/api/protocol/validators/is-protocol-id.validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class SearchLiquidityPoolsFilter implements Omit<ILiquidityPoolFilter, 'chainIds'> {
  @ApiPropertyOptional({
    description: 'The minimum total value locked (USD) for a pool to be included in the response.',
    example: 100000,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(0)
  readonly minimumTotalValueLockedUsd: number = 0;

  @ApiPropertyOptional({
    description: 'Filter out specific liquidity pool types.',
    example: [LiquidityPoolType.ALGEBRA],
    enum: LiquidityPoolType,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(LiquidityPoolType, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  readonly blockedPoolTypes: LiquidityPoolType[] = [];

  @ApiPropertyOptional({
    description: 'Filter out specific protocols by ID.',
    example: ['uniswap-v3'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  readonly blockedProtocols: string[] = [];

  @ApiPropertyOptional({
    description: `
**Allow-list of supported Protocol IDs.** **Stability Note:** While hydric normalizes core pool data, the \`metadata\` field contains protocol/type specific fields (e.g., hooks, plugins, addresses, pool math). If your integration logic depends on these specialized fields, we recommend explicitly defining your supported protocols. This prevents your application from receiving novel protocol structures before your custom logic is ready to parse their unique \`metadata\`.

If omitted, all protocols (excluding \`blockedProtocols\`) are included.`,
    example: ['uniswap-v3', 'uniswap-v4'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsProtocolId({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  readonly protocols: string[] = [];

  @ApiPropertyOptional({
    description: `
**Allow-list of supported Liquidity Pool architectures.**

**Architecture Note:** Use this to restrict results to specific pool designs (V3, V4, etc.). While the top-level schema is unified, depending in your integration logic, you need to use the \`metadata\` field (e.g., allowing deposits), then you should explicitly define your supported architectures. Explicit filtering ensures your UI only attempts to interact with pool structures it is designed to handle.

If omitted, all architectures (excluding \`blockedPoolTypes\`) are included.`,
    example: [LiquidityPoolType.V3],
    enum: LiquidityPoolType,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(LiquidityPoolType, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  readonly poolTypes: LiquidityPoolType[] = [];
}
