import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProjectSnapshotDto {
  @ApiProperty({ description: 'Display name for the snapshot' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Optional description of the snapshot' })
  @IsOptional()
  @IsString()
  description?: string;
}
