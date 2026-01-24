import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateLabelPresetDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsUUID('4', { each: true })
  labelIds: string[];

  @IsString()
  @IsOptional()
  @IsUUID()
  createdById?: string;
}
