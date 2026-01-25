import { HttpException, HttpStatus } from '@nestjs/common';

export const LabelPresetExceptions = {
  LabelPresetNotFound: new HttpException(
    'Label preset not found',
    HttpStatus.NOT_FOUND,
  ),
  LabelPresetNameAlreadyExists: new HttpException(
    'Label preset name already exists',
    HttpStatus.BAD_REQUEST,
  ),
  LabelNotFound: new HttpException('Label not found', HttpStatus.NOT_FOUND),
  LabelPresetStillHasDeletedLabel: new HttpException(
    'Label preset still has deleted label, please restore it first (if soft deleted)',
    HttpStatus.BAD_REQUEST,
  ),
};
