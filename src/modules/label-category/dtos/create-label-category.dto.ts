import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';

@ApiTags('Label Categories')
export class CreateLabelCategoryDto {
  @ApiProperty({
    description: 'The name of the label category',
    example: 'Medical Images',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the label category',
    example: 'Categories for labeling medical images',
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiPropertyOptional({
    description: 'ID of the user who created this category',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsUUID()
  @IsOptional()
  createdById: string;
}
