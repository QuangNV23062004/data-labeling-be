import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CompleteProjectDto {
  @ApiProperty({
    description: 'The ID of the project to complete',
    example: '123e4567-eb89-12d3-a456-426614174000',
  })
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  projectId: string;
}
