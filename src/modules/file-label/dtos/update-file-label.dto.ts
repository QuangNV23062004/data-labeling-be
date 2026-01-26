import { PartialType } from '@nestjs/swagger';
import { CreateFileLabelDto } from './create-file-label.dto';

export class UpdateFileLabelDto extends PartialType(CreateFileLabelDto) {}
