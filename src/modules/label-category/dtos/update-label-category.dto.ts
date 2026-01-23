import { PartialType } from '@nestjs/mapped-types';
import { ApiTags } from '@nestjs/swagger';
import { CreateLabelCategoryDto } from './create-label-category.dto';

@ApiTags('Label Categories')
export class UpdateLabelCategoryDto extends PartialType(
  CreateLabelCategoryDto,
) {}
