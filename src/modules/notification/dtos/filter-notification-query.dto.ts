import { IsBoolean, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BasePaginationQueryDto } from 'src/common/pagination/base-pagination.dto';

const booleanTransform = ({ value }: { value: unknown }): boolean => {
  if (value === undefined || value === null || value === '') return false;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return Boolean(value);
};

export class FilterNotificationQueryDto extends BasePaginationQueryDto {
  accountId?: string;

  @ApiPropertyOptional({ description: 'Return only unread notifications', default: false })
  @IsOptional()
  @Transform(booleanTransform)
  @IsBoolean()
  unreadOnly?: boolean = false;

  @ApiPropertyOptional({ description: 'Include soft-deleted notifications', default: false })
  @IsOptional()
  @Transform(booleanTransform)
  @IsBoolean()
  includeDeleted?: boolean = false;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    default: 'createdAt',
    enum: ['createdAt', 'updatedAt', 'title'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['createdAt', 'updatedAt', 'title'])
  orderBy?: string = 'createdAt';
}
