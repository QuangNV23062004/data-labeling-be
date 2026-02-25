import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class SubmitReviewErrorDto {
  @ApiProperty({
    description: 'UUID of the review error type that categorizes this error',
    example: '123e4567-e89b-12d3-a456-426614174001',
    format: 'uuid',
  })
  @IsNotEmpty()
  @IsUUID()
  reviewErrorTypeId: string;

  @ApiPropertyOptional({
    description: 'JSON object containing error location/coordinates',
    example: { x: 100, y: 200, width: 50, height: 30 },
  })
  @IsOptional()
  @IsObject()
  errorLocation?: object;

  @ApiPropertyOptional({
    description: 'Additional details about the error',
    example: 'Missing label on the upper right corner of the image',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
