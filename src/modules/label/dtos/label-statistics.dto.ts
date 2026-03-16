import { ApiProperty } from '@nestjs/swagger';

export class LabelStatisticsDto {
  @ApiProperty({ description: 'Total number of non-deleted labels' })
  totalLabels: number;

  @ApiProperty({
    description: 'Number of labels with at least one checklist question',
  })
  labelsWithQuestions: number;

  @ApiProperty({
    description: 'Total number of annotator checklist questions',
  })
  annotatorQuestions: number;

  @ApiProperty({ description: 'Total number of reviewer checklist questions' })
  reviewerQuestions: number;
}
