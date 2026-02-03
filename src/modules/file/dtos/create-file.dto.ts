import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateFileDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  projectId: string;

  // Add your properties here
}
