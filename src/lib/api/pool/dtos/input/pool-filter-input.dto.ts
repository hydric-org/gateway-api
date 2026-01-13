import { IPoolFilter } from '@core/interfaces/pool/pool-filter.interface';
import { IsProtocolId } from '@lib/api/protocol/validators/is-protocol-id.validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { PoolType, PoolTypeUtils } from 'src/core/enums/pool/pool-type';

export class PoolFilter implements IPoolFilter {
  @ApiPropertyOptional({
    description: 'Minimum total value locked (TVL) in USD that a pool must have to be included in the results.',
    example: 1000,
    default: 0,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(0)
  readonly minimumTvlUsd: number = 0;

  @ApiPropertyOptional({
    description: 'Array of pool types to be excluded from the search results.',
    example: [PoolType.ALGEBRA, PoolType.V3],
    enum: PoolType,
    isArray: true,
    default: [],
    uniqueItems: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(PoolType, {
    each: true,
    message: `One or more pool types are invalid. Supported: ${PoolTypeUtils.values().join(', ')}`,
  })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  readonly blockedPoolTypes: PoolType[] = [];

  @ApiPropertyOptional({
    description:
      'Array of protocol IDs to be excluded. Fetch valid IDs from [GET /protocols](#/Protocols/ProtocolsController_getProtocols).',
    example: ['uniswap-v3', 'curve-fi'],
    type: [String],
    default: [],
    uniqueItems: true,
  })
  @IsOptional()
  @IsArray()
  @IsProtocolId({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  readonly blockedProtocols: string[] = [];
}
