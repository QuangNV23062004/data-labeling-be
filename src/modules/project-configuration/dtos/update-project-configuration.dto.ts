import { IsNotEmpty, IsArray, ArrayNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProjectConfigurationDto {
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @ApiProperty({
    description: 'Array of available label IDs',
    type: [String],
    example: ['label-id-1', 'label-id-2'],
  })
  availableLabelIds: string[];
}
