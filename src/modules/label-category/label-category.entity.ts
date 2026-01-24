import { BaseEntity } from 'src/common/entity/base.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { AccountEntity } from '../account/account.entity';
import { LabelEntity } from '../label/label.entity';

@Entity('label_categories')
export class LabelCategoryEntity extends BaseEntity {
  @Column({ name: 'name', nullable: false })
  name: string;

  @Column({ name: 'description', nullable: false })
  description: string;

  @Column({ name: 'created_by_id', nullable: false })
  createdById: string;

  @ManyToOne(() => AccountEntity, {
    nullable: false,
  })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: AccountEntity;

  @ManyToMany(() => LabelEntity, (label) => label.categories)
  labels!: LabelEntity[];
}
