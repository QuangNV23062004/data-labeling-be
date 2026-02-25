import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AuthTemplateService {
  constructor() {}

  private resolveTemplatePath(fileName: string): string {
    const candidatePaths = [
      path.join(__dirname, '../../../common/templates/auth', fileName),
      path.join(
        process.cwd(),
        'dist',
        'src',
        'common',
        'templates',
        'auth',
        fileName,
      ),
      path.join(process.cwd(), 'src', 'common', 'templates', 'auth', fileName),
    ];

    const resolvedPath = candidatePaths.find((candidatePath) =>
      fs.existsSync(candidatePath),
    );

    if (!resolvedPath) {
      throw new Error(
        `Template not found: ${fileName}. Checked: ${candidatePaths.join(', ')}`,
      );
    }

    return resolvedPath;
  }

  async getResetPasswordEmailTemplate(): Promise<string> {
    const templatePath = this.resolveTemplatePath(
      'reset-password-email.template.ejs',
    );
    const template = await fs.promises.readFile(templatePath, 'utf8');
    return template;
  }

  async getResetPasswordFormTemplate(): Promise<string> {
    const templatePath = this.resolveTemplatePath(
      'reset-password-form.template.ejs',
    );
    const template = await fs.promises.readFile(templatePath, 'utf8');
    return template;
  }
}
