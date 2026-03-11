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
import { ApiPropertyOptional } from '@nestjs/swagger';
import { FileStatus } from '../enums/file-status.enums';

export class FilterFileQueryDto extends BasePaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Search term for filtering files',
    example: 'example.jpg',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Field to search by',
    example: 'fileName',
    enum: ['fileName', 'fileUrl'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['fileName', 'fileUrl'])
  searchBy?: string;

  @ApiPropertyOptional({
    description: 'Field to order by',
    example: 'createdAt',
    enum: ['fileName', 'fileSize', 'createdAt', 'updatedAt'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['fileName', 'fileSize', 'createdAt', 'updatedAt'])
  orderBy?: string;

  @ApiPropertyOptional({
    description: 'Filter by project ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiPropertyOptional({
    description: 'Filter by uploader ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsUUID()
  uploadedById?: string;

  @ApiPropertyOptional({
    description: 'Filter by annotator ID',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsOptional()
  @IsUUID()
  annotatorId?: string;

  @ApiPropertyOptional({
    description: 'Filter by reviewer ID',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsOptional()
  @IsUUID()
  reviewerId?: string;

  @ApiPropertyOptional({
    description: 'Filter by content type',
    example: ContentType.JPEG,
    enum: ContentType,
  })
  @IsOptional()
  @IsEnum(ContentType)
  contentType?: ContentType;

  @ApiPropertyOptional({
    description: 'Filter by file workflow status',
    example: FileStatus.PENDING_REVIEW,
    enum: FileStatus,
  })
  @IsOptional()
  @IsEnum(FileStatus)
  status?: FileStatus;
}
