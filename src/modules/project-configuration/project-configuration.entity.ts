import { BaseEntity } from 'src/common/entity/base.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { ProjectEntity } from '../project/project.entity';
import { LabelEntity } from '../label/label.entity';

@Entity('project_configurations')
@Index('idx_projectconfiguration_project_id', ['projectId'])
@Index('idx_projectconfiguration_available_label_ids', ['availableLabelIds'])
export class ProjectConfigurationEntity extends BaseEntity {
  @Column({ name: 'project_id', type: 'varchar' })
  projectId: string;

  @OneToOne(() => ProjectEntity, (project) => project.id)
  @JoinColumn({ name: 'project_id' })
  project: ProjectEntity;

  @Column({ name: 'available_label_ids ', type: 'jsonb', nullable: false })
  availableLabelIds: string[];

  @ManyToMany(() => LabelEntity, (label) => label.id)
  @JoinTable({
    name: 'project_configuration_labels',
    joinColumn: {
      name: 'project_configuration_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'label_id',
      referencedColumnName: 'id',
    },
  })
  availableLabels: LabelEntity[];
}
