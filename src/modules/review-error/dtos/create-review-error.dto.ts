import {
  IsJSON,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewErrorDto {
  @ApiProperty({
    description: 'UUID of the review this error is associated with',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsNotEmpty()
  @IsUUID()
  reviewId: string;

  @ApiProperty({
    description: 'UUID of the review error type that categorizes this error',
    example: '123e4567-e89b-12d3-a456-426614174001',
    format: 'uuid',
  })
  @IsNotEmpty()
  @IsUUID()
  reviewErrorTypeId: string;

  @ApiPropertyOptional({
    description:
      'JSON object specifying the location or coordinates where the error was detected.',
    example: { x: 100, y: 200, width: 50, height: 30 },
  })
  @IsOptional()
  @IsObject()
  errorLocation?: any;

  @ApiPropertyOptional({
    description: 'Additional description or details about the error',
    example: 'Missing label on the upper right corner of the image',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
