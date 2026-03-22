import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'chartModeValueNotFuture', async: false })
class ChartModeValueNotFutureConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    if (value === undefined || value === null) {
      return true;
    }

    const query = args.object as GetChartStatisticsQueryDto;
    const mode = query.mode ?? 'year';
    const now = new Date();

    if (mode === 'year') {
      return Number(value) <= now.getUTCFullYear();
    }

    if (mode === 'month') {
      return Number(value) <= now.getUTCMonth() + 1;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments): string {
    const query = args.object as GetChartStatisticsQueryDto;
    const mode = query.mode ?? 'year';
    const now = new Date();

    if (mode === 'month') {
      return `For month mode, value cannot be in the future. Maximum allowed month is ${now.getUTCMonth() + 1}.`;
    }

    if (mode === 'year') {
      return `For year mode, value cannot be in the future. Maximum allowed year is ${now.getUTCFullYear()}.`;
    }

    return 'Invalid value for the selected mode.';
  }
}

export class GetChartStatisticsQueryDto {
  @ApiPropertyOptional({
    description: 'Mode of statistics',
    enum: ['day', 'week', 'month', 'year', 'all-time'],
    default: 'year',
  })
  @IsOptional()
  @IsIn(['day', 'week', 'month', 'year', 'all-time'])
  mode?: 'day' | 'week' | 'month' | 'year' | 'all-time';

  @ApiPropertyOptional({
    description:
      'Target value for mode. For month mode: month number (1-12). For year mode: year (e.g. 2026).',
    example: 2026,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null || value === ''
      ? undefined
      : Number(value),
  )
  @IsInt()
  @Validate(ChartModeValueNotFutureConstraint)
  value?: number;

  @ApiPropertyOptional({
    description:
      'Optional custom range start (ISO date/datetime). If provided, endDate is required.',
    example: '2026-03-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    description:
      'Optional custom range end (ISO date/datetime). If provided, startDate is required.',
    example: '2026-03-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({
    description:
      'Number of buckets for custom range mode. Defaults to 10 when startDate/endDate are used.',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null || value === ''
      ? undefined
      : Number(value),
  )
  @IsInt()
  @Min(1)
  @Max(1000)
  intervalCount?: number = 10;

  @ApiPropertyOptional({
    description:
      'Optional filter to include only projects created by this account id.',
  })
  @IsOptional()
  @IsString()
  createdById?: string;
}
