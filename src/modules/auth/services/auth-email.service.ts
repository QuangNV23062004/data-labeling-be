import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as ejs from 'ejs';
import { TypedConfigService } from 'src/common/typed-config/typed-config.service';
import { MailerService } from '@nestjs-modules/mailer';
import { FailedToSendResetPasswordEmailException } from '../exceptions/auth-exceptions.exceptions';

@Injectable()
export class AuthEmailService {
  constructor(
    private readonly typedConfigService: TypedConfigService,

    private readonly mailerService: MailerService,
  ) {}

  async sendResetPasswordEmail(
    to: string,
    template: string,
    token: string,
  ): Promise<void> {
    const host =
      this.typedConfigService.server.host === 'http://localhost'
        ? `${this.typedConfigService.server.host}:${this.typedConfigService.server.port}/${this.typedConfigService.server.prefix}/${this.typedConfigService.server.version}`
        : `${this.typedConfigService.server.host}/${this.typedConfigService.server.prefix}/${this.typedConfigService.server.version}`;

    const rendered = ejs.render(template, {
      resetUrl: `${host}/auth/reset-password/${token}`,
    });

    await this.mailerService
      .sendMail({
        to,
        subject: 'Reset your password',
        html: rendered,
      })
      .catch((error) => {
        // console.error('Failed to send reset password email:', error);
        throw new FailedToSendResetPasswordEmailException();
      });
  }
}
