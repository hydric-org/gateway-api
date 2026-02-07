import { ApiProperty } from '@nestjs/swagger';

export class ValidationErrorMetadata {
  @ApiProperty({ description: 'The property that failed validation' })
  property!: string;

  @ApiProperty({ description: 'The value that failed validation' })
  value!: any;

  @ApiProperty({
    description:
      'Object containing constraint violations where key is the property name and value is an array of error messages',
    type: 'object',
    additionalProperties: {
      type: 'array',
      items: { type: 'string' },
    },
    example: {
      email: ['email must be an email'],
      password: ['password is too short'],
    },
  })
  constraints!: Record<string, string[]>;
}
