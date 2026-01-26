import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { ProjectStatus } from './enums/project-status.enums';
import { DataType } from './enums/data-type.enums';
import { AccountEntity } from '../account/account.entity';
import { ProjectConfigurationEntity } from '../project-configuration/project-configuration.entity';
import { BaseEntity } from 'src/common/entity/base.entity';

@Entity('projects')
@Index('idx_project_name', ['name'])
@Index('idx_project_created_by_id', ['createdById'])
export class ProjectEntity extends BaseEntity {
  @Column({ name: 'name', type: 'text', nullable: false })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'project_status', type: 'enum', enum: ProjectStatus })
  projectStatus: ProjectStatus;

  @Column({ name: 'data_type', type: 'enum', enum: DataType })
  dataType: DataType;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string;

  @Column({ name: 'created_by_id', nullable: false })
  createdById: string;

  @ManyToOne(() => AccountEntity, {
    nullable: false,
  })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: AccountEntity;

  @OneToOne(() => ProjectConfigurationEntity, {
    nullable: false,
  })
  projectConfiguration: ProjectConfigurationEntity;
}
