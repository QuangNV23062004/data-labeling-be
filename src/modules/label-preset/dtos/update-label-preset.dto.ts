import { PartialType } from '@nestjs/swagger';
import { CreateLabelPresetDto } from './create-label-preset.dto';

export class UpdateLabelPresetDto extends PartialType(CreateLabelPresetDto) {}
