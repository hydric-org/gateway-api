import { ApiProperty } from '@nestjs/swagger';

export class HealthCheckInfo {
  @ApiProperty({ example: 'up' })
  status!: string;

  [key: string]: any;
}

export class HealthCheckDetails {
  @ApiProperty({ type: HealthCheckInfo, required: false })
  memory_heap?: HealthCheckInfo;

  @ApiProperty({ type: HealthCheckInfo, required: false })
  indexer?: HealthCheckInfo;
}

export class HealthCheckResponseDto {
  @ApiProperty({ example: 'ok', enum: ['ok', 'error', 'shutting_down'] })
  status!: string;

  @ApiProperty({ type: HealthCheckDetails, description: 'Only contains passing checks' })
  info!: HealthCheckDetails;

  @ApiProperty({ type: HealthCheckDetails, description: 'Only contains failing checks' })
  error!: HealthCheckDetails;

  @ApiProperty({ type: HealthCheckDetails, description: 'Contains all checks' })
  details!: HealthCheckDetails;
}
