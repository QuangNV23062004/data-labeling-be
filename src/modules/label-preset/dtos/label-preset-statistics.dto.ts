import { ApiProperty } from '@nestjs/swagger';

export class LabelPresetStatisticsDto {
  @ApiProperty({ description: 'Total number of non-deleted label presets' })
  totalPresets: number;

  @ApiProperty({
    description: 'Number of presets that have at least one label',
  })
  presetsWithLabels: number;

  @ApiProperty({ description: 'Average number of labels per preset' })
  avgLabelsPerPreset: number;

  @ApiProperty({ description: 'Average number of presets per label' })
  avgPresetsPerLabel: number;
}
