import { PartialType } from '@nestjs/mapped-types';
import { CreateLabelPresetDto } from './create-label-preset.dto';

export class UpdateLabelPresetDto extends PartialType(CreateLabelPresetDto) {}
