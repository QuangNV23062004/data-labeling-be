import { Injectable, Logger } from '@nestjs/common';
import { ResetPasswordTokenRepository } from './reset-password-token.repository';

@Injectable()
export class ResetPasswordTokenService {
  constructor(
    private readonly resetPasswordTokenRepository: ResetPasswordTokenRepository,
  ) {}

  async DeleteExpiredTokens(): Promise<void> {
    const logger = new Logger('ResetPasswordTokenService');
    try {
      const em = this.resetPasswordTokenRepository.GetEntityManager();

      let result: any;
      (await em).transaction(async (entityManager) => {
        result =
          await this.resetPasswordTokenRepository.DeleteExpiredTokens(
            entityManager,
          );
      });
      logger.debug(`Deleted ${result || 0} expired reset password tokens`);
    } catch (error) {
      //In case 2 transactions are running at the same time
      logger.debug(`Failed to delete expired reset password tokens: ${error}`);
    }
  }
}
