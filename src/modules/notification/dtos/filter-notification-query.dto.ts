import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { BasePaginationQueryDto } from 'src/common/pagination/base-pagination.dto';

export class FilterNotificationQueryDto extends BasePaginationQueryDto {
  @IsOptional()
  @IsUUID()
  accountId?: string;

  @IsOptional()
  @IsBoolean()
  unreadOnly?: boolean = false;

  @IsOptional()
  @IsBoolean()
  includeDeleted?: boolean = false;

  @IsOptional()
  @IsString()
  orderBy?: string;
}
