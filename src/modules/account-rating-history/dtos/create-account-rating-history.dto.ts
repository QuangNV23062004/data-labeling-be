import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAccountRatingHistoryDto {
  @ApiProperty({
    description: 'Account rating ID linked to this history record',
    format: 'uuid',
    example: 'e4d37f68-c6a2-4a99-9656-4ef35d454f5f',
  })
  @IsNotEmpty()
  @IsUUID()
  accountRatingId: string;
}
