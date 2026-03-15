import { ArrayMinSize, IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteNotificationsDto {
  @ApiProperty({
    description: 'Array of notification IDs to delete',
    type: [String],
    example: ['uuid-1', 'uuid-2'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('all', { each: true })
  notificationIds: string[];
}
