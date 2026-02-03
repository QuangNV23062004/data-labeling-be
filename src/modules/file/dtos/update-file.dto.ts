import { PartialType } from '@nestjs/swagger';
import { CreateFileDto } from './create-file.dto';
import { IsOptional, IsUUID } from 'class-validator';

//taskId will be handled by task service
export class UpdateFileDto extends PartialType(CreateFileDto) {}
