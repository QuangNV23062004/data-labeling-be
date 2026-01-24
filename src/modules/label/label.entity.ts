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
import { LabelCategoryEntity } from '../label-category/label-category.entity';
import { AccountEntity } from '../account/account.entity';
import { LabelPresetEntity } from '../label-preset/label-preset.entity';

@Entity('labels')
@Index('IDX_LABEL_NAME', ['name'])
@Index('IDX_LABEL_COLOR', ['color'])
export class LabelEntity extends BaseEntity {
  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @ManyToMany(() => LabelCategoryEntity, (category) => category.labels)
  @JoinTable({
    name: 'label_categories_mapping',
    joinColumn: { name: 'label_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories!: LabelCategoryEntity[];

  @ManyToMany(() => LabelPresetEntity, (preset) => preset.labels)
  presets!: LabelPresetEntity[];

  @Column({ name: 'created_by_id', nullable: false })
  createdById: string;

  @ManyToOne(() => AccountEntity, {
    nullable: false,
  })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: AccountEntity;

  @Column({ name: 'color', type: 'varchar', length: 7, nullable: true })
  color?: string;
}
