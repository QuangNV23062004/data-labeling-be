import { IsNotEmpty, IsString, IsArray, ArrayNotEmpty, IsUUID } from 'class-validator';

export class CreateProjectConfigurationDto {
  @IsNotEmpty()
  @IsString()
  projectId: string;

  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  availableLabelIds: string[];
}
