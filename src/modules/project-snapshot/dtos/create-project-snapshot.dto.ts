import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProjectSnapshotDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  // Add your properties here
}
