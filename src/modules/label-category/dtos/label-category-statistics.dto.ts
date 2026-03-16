import { ApiProperty } from '@nestjs/swagger';

export class LabelCategoryStatisticsDto {
  @ApiProperty({ description: 'Total number of non-deleted label categories' })
  totalCategories: number;

  @ApiProperty({
    description: 'Number of categories that have at least one label',
  })
  categoriesWithLabels: number;

  @ApiProperty({ description: 'Average number of labels per category' })
  avgLabelsPerCategory: number;

  @ApiProperty({ description: 'Average number of categories per label' })
  avgCategoriesPerLabel: number;
}
