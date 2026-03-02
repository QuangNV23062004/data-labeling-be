import { IsNotEmpty, IsString, IsUUID, IsArray, IsEnum, IsOptional, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectTaskDto {
  @ApiProperty({
    description: 'The ID of the project',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  projectId: string;

  @ApiProperty({
    description: 'The ID of the user (annotator or reviewer) who will work on the task',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  assignedUserId: string;

  @ApiProperty({
    description: 'Array of file IDs to be included in the task',
    example: ['123e4567-e89b-12d3-a456-426614174003', '123e4567-e89b-12d3-a456-426614174004'],
    type: [String],
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one file ID must be provided' })
  @IsUUID('4', { each: true })
  fileIds: string[]; 
}
