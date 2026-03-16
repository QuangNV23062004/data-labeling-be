import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetProjectStatisticsQueryDto {
  @ApiPropertyOptional({
    description:
      'Optional filter to only include projects created by this account id',
  })
  @IsOptional()
  @IsString()
  createdById?: string;
}
