import { BaseEntity } from 'src/common/entity/base.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { AccountEntity } from '../account/account.entity';
import { LabelEntity } from '../label/label.entity';

@Entity('label_presets')
@Index('IDX_LABEL_PRESET_NAME', ['name'])
@Index('IDX_LABEL_PRESET_CREATED_BY_ID', ['createdById'])
@Index('IDX_LABEL_PRESET_CREATED_AT', ['createdAt'])
export class LabelPresetEntity extends BaseEntity {
  @Column({ name: 'name', nullable: false })
  name: string;

  @Column({ name: 'description', nullable: true })
  description: string;

  @Column({ name: 'created_by_id', nullable: false })
  createdById: string;

  @ManyToOne(() => AccountEntity, {
    nullable: false,
  })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: AccountEntity;

  @ManyToMany(() => LabelEntity, (label) => label.presets)
  @JoinTable({
    name: 'label_presets_mapping',
    joinColumn: { name: 'preset_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'label_id', referencedColumnName: 'id' },
  })
  labels!: LabelEntity[];
}
