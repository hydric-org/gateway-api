import { IsBoolean, IsOptional } from 'class-validator';

export class PoolSearchConfigDTO {
  @IsOptional()
  @IsBoolean({
    message: 'testnetMode must be a boolean',
  })
  testnetMode: boolean = false;
}
