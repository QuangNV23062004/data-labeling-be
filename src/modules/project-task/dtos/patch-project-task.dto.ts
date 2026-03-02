import { IsOptional, IsUUID, IsArray, ArrayMinSize, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectTaskStatus } from '../enums/task-status.enums';

export class PatchProjectTaskDto {
  @ApiPropertyOptional({
    description: 'The ID of the user (annotator or reviewer) to assign the task to',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsOptional()
  @IsUUID()
  assignedUserId?: string;

  @ApiPropertyOptional({
    description: 'Array of file IDs to be added to the task',
    example: ['123e4567-e89b-12d3-a456-426614174003', '123e4567-e89b-12d3-a456-426614174004'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'If provided, at least one file ID must be in the array' })
  @IsUUID('4', { each: true })
  fileIdsToAdd?: string[];

  @ApiPropertyOptional({
    description: 'Array of file IDs to be removed from the task',
    example: ['123e4567-e89b-12d3-a456-426614174005'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'If provided, at least one file ID must be in the array' })
  @IsUUID('4', { each: true })
  fileIdsToRemove?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(ProjectTaskStatus, { message: `Status must be one of the following: ${Object.values(ProjectTaskStatus).join(', ')}` })
  status?: ProjectTaskStatus;
}
