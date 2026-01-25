import { PartialType } from '@nestjs/swagger';
import { ApiTags } from '@nestjs/swagger';
import { CreateLabelCategoryDto } from './create-label-category.dto';

@ApiTags('Label Categories')
export class UpdateLabelCategoryDto extends PartialType(
  CreateLabelCategoryDto,
) {}
