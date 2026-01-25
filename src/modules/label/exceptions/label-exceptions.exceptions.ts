import { HttpException, HttpStatus } from '@nestjs/common';

export const LabelException = {
  LABEL_NOT_FOUND: new HttpException('Label not found', HttpStatus.NOT_FOUND),
  LABEL_NAME_ALREADY_EXISTED: new HttpException(
    'Label name already exists',
    HttpStatus.BAD_REQUEST,
  ),
  LABEL_CATEGORY_NOT_FOUND: new HttpException(
    'Label category not found',
    HttpStatus.NOT_FOUND,
  ),
  LABEL_CATEGORY_IS_DELETED: new HttpException(
    'Label category is deleted, please restore it first (if soft deleted)',
    HttpStatus.BAD_REQUEST,
  ),
  LABEL_HAS_PRESETS: new HttpException(
    'Cannot delete label, label still exists in presets, please delete it first',
    HttpStatus.BAD_REQUEST,
  ),
  LABEL_HAS_PRESETS_INCLUDED_SOFT_DELETED: new HttpException(
    'Cannot hard delete label, label still exists in presets (including soft deleted), please delete it first',
    HttpStatus.BAD_REQUEST,
  ),
};
