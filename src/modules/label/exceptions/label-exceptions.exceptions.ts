import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

export class LabelNotFoundException extends NotFoundException {
  constructor() {
    super('Label not found');
  }
}

export class LabelNameAlreadyExistsException extends ConflictException {
  constructor() {
    super('Label name already exists');
  }
}

export class LabelCategoryNotFoundException extends NotFoundException {
  constructor() {
    super('Label category not found');
  }
}

export class LabelCategoryIsDeletedE extends BadRequestException {
  constructor() {
    super(
      'Label category is deleted, please restore it first (if soft deleted)',
    );
  }
}

export class LabelHasPresetsException extends BadRequestException {
  constructor() {
    super(
      'Cannot delete label, label still exists in presets, please delete it first',
    );
  }
}

export class LabelHasPresetsIncludedSoftDeletedException extends BadRequestException {
  constructor() {
    super(
      'Cannot hard delete label, label still exists in presets (including soft deleted), please delete it first',
    );
  }
}
