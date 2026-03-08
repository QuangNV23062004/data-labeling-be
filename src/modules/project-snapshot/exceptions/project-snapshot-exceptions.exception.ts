import { NotFoundException } from '@nestjs/common';

export class ProjectSnapshotNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Project snapshot with ID ${id} not found`);
  }
}
