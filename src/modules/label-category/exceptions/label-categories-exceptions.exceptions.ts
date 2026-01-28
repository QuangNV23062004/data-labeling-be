import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

export class LabelCategoryNotFoundException extends NotFoundException {
  constructor() {
    super('Label category not found');
  }
}

export class LabelCategoryNameAlreadyExistsException extends ConflictException {
  constructor() {
    super('Label category name already exists');
  }
}

export class LabelCategoryStillHasLabelsException extends BadRequestException {
  constructor() {
    super('Label category still has labels');
  }
}

export class LabelCategoryStillHasIncludeDeletedLabelException extends BadRequestException {
  constructor() {
    super(
      'Label category still has labels (including soft-deleted ones). Please hard-delete them first.',
    );
  }
}
