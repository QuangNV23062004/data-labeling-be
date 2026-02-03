import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypedConfigService } from 'src/common/typed-config/typed-config.service';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import {
  InvalidAccessTokenException,
  InvalidRefreshTokenException,
  InvalidResetPasswordTokenException,
} from '../exceptions/auth-exceptions.exceptions';

@Injectable()
export class AuthJwtService {
  constructor(
    private readonly jwtService: JwtService,

    private readonly typedConfigService: TypedConfigService,
  ) {}

  async createAccessToken(payload: any): Promise<string> {
    const accessToken = await this.jwtService.signAsync(payload, {
      algorithm: 'RS256',
      privateKey: this.typedConfigService.jwt.privateAccessKey as jwt.Secret,
      expiresIn: this.typedConfigService.jwt
        .accessExpiresIn as jwt.SignOptions['expiresIn'],
    });
    return accessToken;
  }

  async createRefreshToken(payload: any): Promise<string> {
    const refreshToken = await this.jwtService.signAsync(payload, {
      algorithm: 'RS256',
      privateKey: this.typedConfigService.jwt.privateRefreshKey as jwt.Secret,
      expiresIn: this.typedConfigService.jwt
        .refreshExpiresIn as jwt.SignOptions['expiresIn'],
    });
    return refreshToken;
  }

  async verifyAccessToken(token: string, isPublic?: boolean): Promise<any> {
    if (!token && !isPublic) {
      throw new UnauthorizedException();
    }
    let decoded: any;
    try {
      decoded = await this.jwtService.verifyAsync(token, {
        algorithms: ['RS256'],
        publicKey: this.typedConfigService.jwt.publicAccessKey as string,
      });
      if (!decoded) {
        throw new InvalidAccessTokenException();
      }
    } catch (error) {
      throw new InvalidAccessTokenException();
    }
    return decoded;
  }

  async verifyRefreshToken(token: string): Promise<any> {
    if (!token) {
      throw new InvalidRefreshTokenException();
    }
    let decoded: any;
    try {
      decoded = await this.jwtService.verifyAsync(token, {
        algorithms: ['RS256'],
        publicKey: this.typedConfigService.jwt.publicRefreshKey as string,
      });
      if (!decoded) {
        throw new InvalidRefreshTokenException();
      }
    } catch (error) {
      throw new InvalidRefreshTokenException();
    }

    return decoded;
  }

  async createResetPasswordToken(payload: any): Promise<string> {
    const resetToken = await this.jwtService.signAsync(payload, {
      algorithm: 'HS256',
      privateKey: this.typedConfigService.jwt.resetPasswordKey as jwt.Secret,
      expiresIn: this.typedConfigService.jwt
        .resetPasswordExpiresIn as jwt.SignOptions['expiresIn'],
    });

    return resetToken;
  }

  async verifyResetPasswordToken(token: string): Promise<any> {
    const decoded: any = await this.jwtService.verifyAsync(token, {
      algorithms: ['HS256'],
      publicKey: this.typedConfigService.jwt.resetPasswordKey as string,
    });

    if (!decoded) {
      throw new InvalidResetPasswordTokenException();
    }
    return decoded;
  }

  async compareResetTokenHash(token: string, hash: string): Promise<void> {
    const isTokenValid = await bcrypt.compare(token, hash);

    if (!isTokenValid) {
      throw new InvalidResetPasswordTokenException();
    }
  }

  parseExpiresIn(expiresIn: string | number): number {
    if (typeof expiresIn === 'number') {
      return expiresIn * 1000; // assume seconds
    }
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error('Invalid expiresIn format');
    }
    const value = parseInt(match[1]);
    const unit = match[2];
    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        throw new Error('Invalid unit');
    }
  }
}
