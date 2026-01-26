import { PartialType } from '@nestjs/swagger';
import { CreateProjectInstructionDto } from './create-project-instruction.dto';

export class UpdateProjectInstructionDto extends PartialType(CreateProjectInstructionDto) {}
