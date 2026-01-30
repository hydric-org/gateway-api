import { LiquidityPoolType } from '@core/enums/liquidity-pool/liquidity-pool-type';
import { ILiquidityPoolFilter } from '@core/interfaces/liquidity-pool/liquidity-pool-filter.interface';
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
}
