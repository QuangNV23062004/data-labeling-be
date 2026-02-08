import { BaseEntity } from 'src/common/entity/base.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Role } from '../account/enums/role.enum';
import { LabelEntity } from '../label/label.entity';
import { AccountEntity } from '../account/account.entity';

@Entity('label_checklist_questions')
@Index('idx_labelchecklistquestion_label_id', ['labelId'])
@Index('idx_labelchecklistquestion_role', ['roleEnum'])
@Index('idx_labelchecklistquestion_label_id_role', ['labelId', 'roleEnum'])
export class LabelChecklistQuestionEntity extends BaseEntity {
  @Column({ name: 'label_id', type: 'uuid', nullable: true })
  labelId: string;

  @ManyToOne(() => LabelEntity)
  @JoinColumn({ name: 'label_id' })
  label: LabelEntity;

  @Column({ name: 'name', type: 'text', nullable: false })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'role', type: 'enum', enum: [Role.ANNOTATOR, Role.REVIEWER] })
  roleEnum: Role;

  @Column({ name: 'created_by_id', type: 'uuid', nullable: false })
  createdById: string;

  @Column({ name: 'is_required', type: 'boolean', default: false })
  isRequired: boolean;

  @ManyToOne(() => AccountEntity, {
    nullable: false,
  })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: AccountEntity;
}
