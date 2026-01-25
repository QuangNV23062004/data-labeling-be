import { Injectable } from '@nestjs/common';
import { ResetPasswordTokenService } from './reset-password-token.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class ResetPasswordTokenCron {
  constructor(
    private readonly resetPasswordTokenService: ResetPasswordTokenService,
  ) {}

  @Cron('* * * * *', {
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleDeleteExpiredTokens() {
    await this.resetPasswordTokenService.DeleteExpiredTokens();
  }
}
