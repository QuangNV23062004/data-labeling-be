import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyResetPasswordTokenDto {
  @ApiProperty({
    description: 'Reset password token',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: 'New password',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Confirm new password',
  })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}
