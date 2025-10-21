import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PoolType } from '../enums/pool-type';

export class PoolSearchFiltersDTO {
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @IsNumber(
    {
      allowInfinity: false,
      allowNaN: false,
    },
    { message: 'minimumTvlUsd must be a positive number' },
  )
  minimumTvlUsd: number = 0;

  @IsOptional()
  @IsEnum(PoolType, {
    each: true,
    message: `Each blockedPoolType must be a valid PoolType: ${Object.values(PoolType).join(', ')}`,
  })
  blockedPoolTypes: PoolType[] = [];

  @IsOptional()
  @IsString({
    each: true,
    message: 'Each blockedProtocol should be a protocol id as string',
  })
  blockedProtocols: string[] = [];
}
