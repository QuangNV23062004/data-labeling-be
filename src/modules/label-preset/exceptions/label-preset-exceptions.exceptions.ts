import { HttpException, HttpStatus } from '@nestjs/common';

export const LabelPresetExceptions = {
  LABEL_PRESET_NOT_FOUND: new HttpException(
    'Label preset not found',
    HttpStatus.NOT_FOUND,
  ),
  LABEL_PRESET_NAME_ALREADY_EXISTED: new HttpException(
    'Label preset name already exists',
    HttpStatus.BAD_REQUEST,
  ),
  LABEL_NOT_FOUND: new HttpException('Label not found', HttpStatus.NOT_FOUND),
  LABEL_PRESET_STILL_HAS_INCLUDE_DELETED_LABELS: new HttpException(
    'Label preset still has deleted labels, please restore them first (if soft deleted)',
    HttpStatus.BAD_REQUEST,
  ),
};
