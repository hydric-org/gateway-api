import { ApiKeyClient } from '@infrastructure/auth/clients/api-key.client';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';

@Module({
  providers: [AuthService, ApiKeyClient],
  exports: [AuthService],
})
export class AuthModule {}
