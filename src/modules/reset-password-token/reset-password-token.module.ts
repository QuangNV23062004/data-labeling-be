import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResetPasswordTokenEntity } from './reset-password-token.entity';
import { ResetPasswordTokenRepository } from './reset-password-token.repository';
import { ResetPasswordTokenService } from './reset-password-token.service';
import { ResetPasswordTokenCron } from './reset-password-token.cron';

@Module({
  imports: [TypeOrmModule.forFeature([ResetPasswordTokenEntity])],
  providers: [
    ResetPasswordTokenRepository,
    ResetPasswordTokenService,
    ResetPasswordTokenCron,
  ],
  exports: [ResetPasswordTokenRepository],
})
export class ResetPasswordTokenModule {}
