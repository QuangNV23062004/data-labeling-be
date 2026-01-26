import { PartialType } from '@nestjs/swagger';
import { CreateProjectConfigurationDto } from './create-project-configuration.dto';

export class UpdateProjectConfigurationDto extends PartialType(CreateProjectConfigurationDto) {}
