import { HttpException, HttpStatus } from '@nestjs/common';

export const LabelCategoryException = {
  LABEL_CATEGORY_NOT_FOUND: new HttpException(
    'Label category not found',
    HttpStatus.NOT_FOUND,
  ),

  LABEL_CATEGORY_NAME_ALREADY_EXISTED: new HttpException(
    'Label category name already exists',
    HttpStatus.BAD_REQUEST,
  ),

  LABEL_CATEGORY_STILL_HAS_LABELS: new HttpException(
    'Label category still has labels',
    HttpStatus.BAD_REQUEST,
  ),

  LABEL_CATEGORY_STILL_HAS_INCLUDE_DELETED_LABEL: new HttpException(
    'Label category still has labels (including soft-deleted ones). Please hard-delete them first.',
    HttpStatus.BAD_REQUEST,
  ),
};
