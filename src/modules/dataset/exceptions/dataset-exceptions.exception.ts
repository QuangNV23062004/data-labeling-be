import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

export class DatasetNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Dataset with ID "${id}" not found`);
  }
}

export class DatasetAlreadyExistsException extends ConflictException {
  constructor(identifier: string) {
    super(`Dataset with identifier "${identifier}" already exists`);
  }
}

export class InvalidDatasetException extends BadRequestException {
  constructor(message: string) {
    super(`Invalid dataset: ${message}`);
  }
}

export class ExportSnapshotNotFoundException extends NotFoundException {
  constructor(snapshotId: string) {
    super(`Snapshot with ID "${snapshotId}" not found`);
  }
}

export class ExportEmptySnapshotException extends BadRequestException {
  constructor(snapshotId: string) {
    super(`Snapshot with ID "${snapshotId}" contains no files to export`);
  }
}

export class ExportJobNotFoundException extends NotFoundException {
  constructor(exportId: string) {
    super(`Export job with ID "${exportId}" not found or has expired`);
  }
}

export class ExportJobNotReadyException extends ConflictException {
  constructor(exportId: string, status: string) {
    super(
      `Export job "${exportId}" is not ready for download (status: ${status})`,
    );
  }
}
