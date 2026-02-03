import { BaseEntity } from 'src/common/entity/base.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { ProjectEntity } from '../project/project.entity';
import { AccountEntity } from '../account/account.entity';
import { ContentType } from './enums/content-type.enums';
import { ProjectTaskEntity } from '../project-task/project-task.entity';
import { FileLabelEntity } from '../file-label/file-label.entity';

@Entity({ name: 'files' })
@Index('idx_file_project_id', ['projectId'])
@Index('idx_file_uploaded_by_id', ['uploadedById'])
@Index('idx_file_task_id', ['taskId'])
export class FileEntity extends BaseEntity {
  @Column({ name: 'project_id', type: 'uuid', nullable: false })
  projectId: string;

  @ManyToOne(() => ProjectEntity, (project) => project.id)
  @JoinColumn({ name: 'project_id' })
  project: ProjectEntity;

  @Column({ name: 'file_name', type: 'varchar', nullable: false })
  fileName: string;

  @Column({ name: 'file_size', type: 'int', nullable: false })
  fileSize: number;

  @Column({
    name: 'content_type',
    type: 'enum',
    enum: ContentType,
    nullable: false,
  })
  contentType: ContentType;

  @Column({ name: 'file_url', type: 'varchar', nullable: false })
  fileUrl: string;

  @Column({ name: 'uploaded_by_id', type: 'uuid', nullable: false })
  uploadedById: string;

  @ManyToOne(() => AccountEntity, (account) => account.id)
  @JoinColumn({ name: 'uploaded_by_id' })
  uploadedBy: AccountEntity;

  //may be add status to track ?

  @Column({ name: 'task_id', type: 'uuid', nullable: true })
  taskId: string | null;

  @ManyToOne(() => ProjectTaskEntity, (task) => task.files, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'task_id' })
  projectTask: ProjectTaskEntity | null;

  @OneToMany(() => FileLabelEntity, (fileLabel) => fileLabel.file)
  fileLabels: FileLabelEntity[];
}
