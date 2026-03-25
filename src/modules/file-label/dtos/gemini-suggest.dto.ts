import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class GeminiSuggestDto {
  @ApiProperty({
    description: 'The ID of the file to analyze',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  fileId: string;

  @ApiPropertyOptional({
    description: 'Additional context or instructions to include in the Gemini prompt',
    example: 'Focus on the subject of the image, ignore the background.',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  additionalPrompt?: string;
}
