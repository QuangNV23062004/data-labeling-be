import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { NotificationType } from '../enums/notification-types.enums';

export class CreateNotificationDto {
  @IsUUID()
  @IsNotEmpty()
  accountId: string;

  @IsEnum(NotificationType)
  notificationType: NotificationType;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsUUID()
  relatedEntityId?: string | null;

  @IsOptional()
  additionalData?: Record<string, any> | null;
}
