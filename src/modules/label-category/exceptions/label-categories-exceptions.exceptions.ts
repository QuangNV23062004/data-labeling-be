import { HttpException, HttpStatus } from '@nestjs/common';

export const LabelCategoryException = {
  LabelCategoryNotFound: new HttpException(
    'Label category not found',
    HttpStatus.NOT_FOUND,
  ),

  LabelCategoryNameAlreadyExists: new HttpException(
    'Label category name already exists',
    HttpStatus.BAD_REQUEST,
  ),

  LabelCategoryStillHasLabels: new HttpException(
    'Label category still has labels',
    HttpStatus.BAD_REQUEST,
  ),

  LabelCategoryStillHasDeletedLabels: new HttpException(
    'Label category still has labels (including soft-deleted ones). Please hard-delete them first.',
    HttpStatus.BAD_REQUEST,
  ),
};
