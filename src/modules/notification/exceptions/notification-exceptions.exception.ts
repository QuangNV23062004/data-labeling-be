import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

export class NotificationNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Notification with ID "${id}" not found`);
  }
}

export class NotificationAlreadyExistsException extends ConflictException {
  constructor(identifier: string) {
    super(`Notification with identifier "${identifier}" already exists`);
  }
}

export class InvalidNotificationException extends BadRequestException {
  constructor(message: string) {
    super(`Invalid notification: ${message}`);
  }
}
