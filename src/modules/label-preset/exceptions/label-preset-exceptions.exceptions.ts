import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

export class LabelPresetNotFoundException extends NotFoundException {
  constructor() {
    super('Label preset not found');
  }
}

export class LabelPresetNameAlreadyExistsException extends ConflictException {
  constructor() {
    super('Label preset name already exists');
  }
}

export class LabelNotFoundException extends NotFoundException {
  constructor() {
    super('Label not found');
  }
}

export class LabelPresetStillHasIncludeDeletedLabelsException extends BadRequestException {
  constructor() {
    super(
      'Label preset still has deleted labels, please restore them first (if soft deleted)',
    );
  }
}
