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
import { LabelChecklistQuestionAnswerEntity } from '../label-checklist-question-answer/label-checklist-question-answer.entity';

@Entity('label_checklist_questions')
@Index('idx_labelchecklistquestion_label_id', ['labelId'])
@Index('idx_labelchecklistquestion_label_checklist_question_id', [
  'labelChecklistQuestionId',
])
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

  @Column({ name: 'label_checklist_question_id', type: 'uuid', nullable: true })
  labelChecklistQuestionId: string;

  @ManyToOne(
    () => LabelChecklistQuestionEntity,
    (labelChecklistQuestion) => labelChecklistQuestion.children,
  )
  @JoinColumn({ name: 'label_checklist_question_id' })
  parent: LabelChecklistQuestionEntity;

  @OneToMany(
    () => LabelChecklistQuestionEntity,
    (labelChecklistQuestion) => labelChecklistQuestion.parent,
  )
  children: LabelChecklistQuestionEntity[];

  @Column({ name: 'role', type: 'enum', enum: [Role.ANNOTATOR, Role.REVIEWER] })
  roleEnum: Role;

  @Column({ name: 'created_by_id', nullable: false })
  createdById: string;

  @ManyToOne(() => AccountEntity, {
    nullable: false,
  })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: AccountEntity;

  @OneToMany(
    () => LabelChecklistQuestionAnswerEntity,
    (labelChecklistQuestionAnswer) => labelChecklistQuestionAnswer.question,
  )
  answers: LabelChecklistQuestionAnswerEntity[];
}
