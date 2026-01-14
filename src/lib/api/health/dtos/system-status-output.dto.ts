import { ApiProperty } from '@nestjs/swagger';

export class SystemStatusInfo {
  @ApiProperty({ description: 'The current version of the API', example: '1.0.0' })
  version!: string;

  @ApiProperty({ description: 'The current environment', example: 'production' })
  env!: string;

  @ApiProperty({ description: 'The uptime of the process in seconds', example: 3600 })
  uptime!: number;
}

export class SystemStatusDto {
  @ApiProperty({ description: 'The status of the API', example: 'OK' })
  status!: string;

  @ApiProperty({ type: SystemStatusInfo })
  info!: SystemStatusInfo;
}
