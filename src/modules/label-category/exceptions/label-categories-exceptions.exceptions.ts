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
};
