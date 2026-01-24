import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateLabelDto {
  @ApiPropertyOptional({ description: 'Label name', example: 'Urgent' })
  @IsString()
  name: string;
  @ApiPropertyOptional({
    description: 'Label description',
    example: 'Tasks that need immediate attention',
    required: false,
  })
  @IsString()
  description?: string;
  @ApiPropertyOptional({
    description: 'Array of Label Category IDs',
    example: ['uuid1', 'uuid2'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  categoryIds: string[];
  @ApiPropertyOptional({
    description: 'Label color',
    example: '#FF0000',
    required: false,
  })
  @IsString()
  color?: string = '#858585ff';

  @ApiPropertyOptional({
    description: 'ID of the account creating the label',
    example: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsString()
  createdById?: string;
}
