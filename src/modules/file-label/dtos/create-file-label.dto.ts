import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { FileLabelStatusEnums } from '../enums/file-label.enums';

export class CreateFileLabelDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  fileId: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  labelId: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  annotatorId: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  reviewerId?: string;

  @IsOptional()
  @IsEnum(FileLabelStatusEnums)
  status?: FileLabelStatusEnums;
}
