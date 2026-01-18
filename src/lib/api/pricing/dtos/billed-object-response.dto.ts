import { Type } from '@nestjs/common';
import { Exclude } from 'class-transformer';

export class _Internal_BilledObjectResponse {
  @Exclude()
  readonly objectType: Type;
  @Exclude()
  readonly count: number;

  constructor(params: { count: number; objectType: Type }) {
    this.count = params.count;
    this.objectType = params.objectType;
  }
}
