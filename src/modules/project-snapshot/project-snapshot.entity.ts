import { BaseEntity } from 'src/common/entity/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { ProjectEntity } from '../project/project.entity';
import { AccountEntity } from '../account/account.entity';

@Entity({ name: 'project_snapshots' })
@Index('idx_projectsnapshot_project_id', ['projectId'])
@Index('idx_projectsnapshot_created_by_id', ['createdById'])
export class ProjectSnapshotEntity extends BaseEntity {
  @Column({ name: 'project_id', type: 'uuid', nullable: false })
  projectId: string;

  @ManyToOne(() => ProjectEntity, (project) => project.id)
  @JoinColumn({ name: 'project_id' })
  project: ProjectEntity;

  @Column({ name: 'version', type: 'varchar', nullable: false })
  version: string;

  @Column({ name: 'name', type: 'varchar', nullable: false })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'snapshot_data', type: 'jsonb', nullable: false })
  snapshotData: any;

  @Column({ name: 'total_files', type: 'int', nullable: false })
  totalFiles: number;

  @Column({ name: 'created_by_id', nullable: false })
  createdById: string;

  @ManyToOne(() => AccountEntity, {
    nullable: false,
  })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: AccountEntity;
}
