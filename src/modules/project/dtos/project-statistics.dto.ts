import { ApiProperty } from '@nestjs/swagger';

export class ProjectStatisticsDto {
  @ApiProperty({ description: 'Total number of non-deleted projects' })
  totalCount: number;

  @ApiProperty({ description: 'Number of active projects' })
  activeCount: number;

  @ApiProperty({ description: 'Number of completed projects' })
  completedCount: number;

  @ApiProperty({ description: 'Number of archived projects' })
  archivedCount: number;
}
