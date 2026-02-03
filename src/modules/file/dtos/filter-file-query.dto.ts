import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsIn,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BasePaginationQueryDto } from 'src/common/pagination/base-pagination.dto';
import { ContentType } from '../enums/content-type.enums';

export class FilterFileQueryDto extends BasePaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  @IsIn(['fileName', 'fileUrl'])
  searchBy?: string;

  @IsOptional()
  @IsString()
  @IsIn(['fileName', 'fileSize', 'createdAt', 'updatedAt'])
  orderBy?: string;

  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @IsUUID()
  uploadedById?: string;

  @IsOptional()
  @IsUUID()
  taskId?: string;

  @IsOptional()
  @IsEnum(ContentType)
  contentType?: ContentType;
}
