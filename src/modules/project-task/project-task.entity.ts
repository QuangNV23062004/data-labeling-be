import { BaseEntity } from 'src/common/entity/base.entity';
import { ProjectEntity } from '../project/project.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { FileEntity } from '../file/file.entity';
import { AccountEntity } from '../account/account.entity';
import { ProjectTaskPriorityEnums } from './enums/task-priority.enums';
import { ProjectTaskStatus } from './enums/task-status.enums';

@Entity({ name: 'project_tasks' })
@Index('idx_projecttask_project_id', ['projectId'])
@Index('idx_projecttask_assigned_to', ['assignedTo'])
@Index('idx_projecttask_status', ['status'])
@Index('idx_projecttask_assigned_by', ['assignedBy'])
export class ProjectTaskEntity extends BaseEntity {
  @Column({ name: 'project_id', type: 'varchar' })
  projectId: string;

  @ManyToOne(() => ProjectEntity, (project) => project.id)
  @JoinColumn({ name: 'project_id' })
  project: ProjectEntity;

  @Column({ name: 'assigned_to', type: 'uuid', nullable: false })
  assignedTo: string;

  @ManyToOne(() => AccountEntity, (account) => account.id)
  @JoinColumn({ name: 'assigned_to' })
  assignedToAccount: AccountEntity;

  @Column({ name: 'assigned_by', type: 'uuid', nullable: false })
  assignedBy: string;

  @ManyToOne(() => AccountEntity, (account) => account.id)
  @JoinColumn({ name: 'assigned_by' })
  assignedByAccount: AccountEntity;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt: Date | null;

  // both is the same?
  @Column({ name: 'submitted_at', type: 'timestamptz', nullable: true })
  submittedAt: Date | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @Column({ name: 'status', type: 'enum', enum: ProjectTaskStatus })
  status: ProjectTaskStatus;

  @Column({ name: 'priority', type: 'enum', enum: ProjectTaskPriorityEnums })
  priority: ProjectTaskPriorityEnums;

  @OneToMany(() => FileEntity, (file) => file.projectTask)
  files: FileEntity[];
}
