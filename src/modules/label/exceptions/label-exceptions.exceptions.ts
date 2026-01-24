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
};
