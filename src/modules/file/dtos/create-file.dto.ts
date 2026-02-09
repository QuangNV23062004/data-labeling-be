import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFileDto {
  @ApiProperty({
    description: 'The ID of the project to which the file belongs',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  projectId: string;

  @ApiPropertyOptional({
    description: 'The ID of the annotator assigned to the file',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsUUID()
  annotatorId?: string;

  @ApiPropertyOptional({
    description: 'The ID of the reviewer assigned to the file',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsOptional()
  @IsUUID()
  reviewerId?: string;
}
