import { PartialType } from '@nestjs/swagger';
import { CreateProjectSnapshotDto } from './create-project-snapshot.dto';

export class UpdateProjectSnapshotDto extends PartialType(CreateProjectSnapshotDto) {}
