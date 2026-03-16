import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetLabelCategoryStatisticsQueryDto {
  @ApiPropertyOptional({
    description:
      'Optional filter to only include categories created by this account id',
  })
  @IsOptional()
  @IsString()
  createdById?: string;
}
