import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateLabelPresetDto {
  @ApiProperty({
    description: 'Label preset name',
    example: 'Default Annotation Labels',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Label preset description',
    example: 'A collection of commonly used labels for image annotation',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Array of label IDs to include in this preset',
    example: [
      '05da212a-abc3-4f70-9955-b630fd911da1',
      'b7c8d3e4-f5a6-4b7c-8d9e-0f1a2b3c4d5e',
    ],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsUUID('4', { each: true })
  labelIds: string[];

  @ApiPropertyOptional({
    description: 'ID of the user creating this label preset',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  createdById?: string;
}
