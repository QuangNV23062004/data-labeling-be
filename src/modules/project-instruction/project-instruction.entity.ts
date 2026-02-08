import { BaseEntity } from 'src/common/entity/base.entity';
import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';
import { ProjectEntity } from '../project/project.entity';

@Entity({ name: 'project_instructions' })
@Index('idx_projectinstruction_project_id', ['projectId'])
export class ProjectInstructionEntity extends BaseEntity {
  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @OneToOne(() => ProjectEntity, (project) => project.id)
  @JoinColumn({ name: 'project_id' })
  project: ProjectEntity;

  @Column({ name: 'title', type: 'text' })
  title: string;

  @Column({ name: 'content', type: 'text' })
  content: string;

  @Column({ name: 'attachment_url', type: 'text', nullable: true })
<<<<<<< HEAD
  attachmentUrl: string;
=======
  attachmentUrl: string | null;
>>>>>>> 030e921a38fd79fa7bfee8eee3bda4a5d95e1fcb
}
