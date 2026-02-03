import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FileLabelStatusEnums } from '../enums/file-label.enums';

export class FilterFileLabelQueryDto {
  @IsOptional()
  @IsString()
  @IsUUID()
  fileId?: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  labelId?: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  annotatorId?: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  reviewerId?: string;

  @IsOptional()
  @IsEnum(FileLabelStatusEnums)
  status?: FileLabelStatusEnums;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  searchBy?: string = 'id';

  @IsOptional()
  @IsString()
  orderBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  order?: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
