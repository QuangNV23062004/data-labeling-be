import { HttpException, HttpStatus } from '@nestjs/common';

export const LabelException = {
  LabelNotFound: new HttpException('Label not found', HttpStatus.NOT_FOUND),
  LabelNameAlreadyExists: new HttpException(
    'Label name already exists',
    HttpStatus.BAD_REQUEST,
  ),
  LabelCategoryNotFound: new HttpException(
    'Label category not found',
    HttpStatus.NOT_FOUND,
  ),
  LabelCategoryIsDeleted: new HttpException(
    'Label category is deleted, please restore it first(if soft deleted)',
    HttpStatus.BAD_REQUEST,
  ),
  LabelHasPresets: new HttpException(
    'Can not delete label, label still exist in presets, please delete it first',
    HttpStatus.BAD_REQUEST,
  ),
  LabelHasPresetsIncludeSoftDeleted: new HttpException(
    'Can not hard delete label, label still exist in presets(include soft deleted), please delete it first',
    HttpStatus.BAD_REQUEST,
  ),
};
