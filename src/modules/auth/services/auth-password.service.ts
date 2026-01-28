import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PasswordNotStrongEnoughException } from '../exceptions/auth-exceptions.exceptions';

@Injectable()
export class AuthPasswordService {
  constructor() {}

  async hashToken(token: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(token, salt);
    return hash;
  }
  async hashPassword(
    password: string,
  ): Promise<{ salt: string; hash: string }> {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(password, salt);
    return { salt, hash };
  }

  async comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<void> {
    const passwordValid = await bcrypt.compare(plainPassword, hashedPassword);
    if (!passwordValid) {
      throw new PasswordNotStrongEnoughException();
    }
  }

  async isPasswordStrong(password: string): Promise<void> {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    if (
      password.length < minLength ||
      !hasUpperCase ||
      !hasLowerCase ||
      !hasNumber ||
      !hasSpecialChar
    ) {
      throw new PasswordNotStrongEnoughException();
    }
  }
}
