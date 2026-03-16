import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetLabelPresetStatisticsQueryDto {
  @ApiPropertyOptional({
    description:
      'Optional filter to only include presets created by this account id',
  })
  @IsOptional()
  @IsString()
  createdById?: string;
}
