import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'ID of the account to send the notification to',
    format: 'uuid',
    example: 'a9a81733-dc95-4436-8e4d-a328f3cdc77b',
  })
  @IsUUID()
  @IsNotEmpty()
  accountId: string;

  @ApiProperty({
    description: 'Short title of the notification',
    example: 'Task assigned to you',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Full body content of the notification',
    example: 'You have been assigned to task "Label batch #42".',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    description:
      'Arbitrary extra data to attach to the notification. ' +
      'Use the "type" key to categorise the notification (e.g. task_assigned, system_alert).',
    type: 'object',
    additionalProperties: true,
    example: { type: 'task_assigned', projectId: 'abc', taskName: 'Label batch #42' },
    nullable: true,
  })
  @IsOptional()
  additionalData?: Record<string, any> | null;
}
