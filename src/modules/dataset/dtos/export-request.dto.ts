import { IsBoolean, IsOptional } from 'class-validator';

export class ExportRequestDto {
  @IsOptional()
  @IsBoolean()
  includeFileUrl?: boolean = true;

  @IsOptional()
  @IsBoolean()
  includeAnnotatorInfo?: boolean = false;

  @IsOptional()
  @IsBoolean()
  includeReviewerInfo?: boolean = false;

  @IsOptional()
  @IsBoolean()
  includeLabelColor?: boolean = true;
}
