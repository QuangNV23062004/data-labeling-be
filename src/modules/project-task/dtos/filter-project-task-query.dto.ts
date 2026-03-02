import { IsOptional, IsUUID, IsEnum, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BasePaginationQueryDto } from 'src/common/pagination/base-pagination.dto';
import { ProjectTaskStatus } from '../enums/task-status.enums';

export class FilterProjectTaskQueryDto extends BasePaginationQueryDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'uuid',
    description: 'Filter by project ID',
  })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiPropertyOptional({
    enum: ProjectTaskStatus,
    description: 'Filter by task status',
  })
  @IsOptional()
  @IsEnum(ProjectTaskStatus)
  status?: ProjectTaskStatus;

  @ApiPropertyOptional({
    type: 'string',
    format: 'uuid',
    description: 'Filter by assigned by user ID (manager)',
  })
  @IsOptional()
  @IsUUID()
  assignedByUserId?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'uuid',
    description: 'Filter by assigned to user ID (annotator)',
  })
  @IsOptional()
  @IsUUID()
  assignedToUserId?: string;

  @ApiPropertyOptional({
    type: 'string',
    enum: ['createdAt', 'updatedAt', 'startedAt', 'completedAt'],
    description: 'Field to order results by',
  })
  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'startedAt', 'completedAt'])
  orderBy?: string;
}
