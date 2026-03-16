import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetLabelStatisticsQueryDto {
  @ApiPropertyOptional({
    description:
      'Optional filter to only include labels created by this account id',
  })
  @IsOptional()
  @IsString()
  createdById?: string;
}
