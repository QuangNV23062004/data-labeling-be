import { BaseEntity } from 'src/common/entity/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { FileLabelEntity } from '../file-label/file-label.entity';
import { LabelChecklistQuestionEntity } from '../label-checklist-question/label-checklist-question.entity';
import { AccountEntity } from '../account/account.entity';

@Entity('label_checklist_question_answers')
@Index('idx_labelchecklistquestionanswer_file_label_id', ['fileLabelId'])
@Index('idx_labelchecklistquestionanswer_question_id', ['questionId'])
@Index('idx_labelchecklistquestionanswer_answer_by_id', ['answerById'])
export class LabelChecklistQuestionAnswerEntity extends BaseEntity {
  @Column({ name: 'file_label_id', type: 'uuid', nullable: false })
  fileLabelId: string;

  @ManyToOne(() => FileLabelEntity, { nullable: false })
  @JoinColumn({ name: 'file_label_id' })
  fileLabel: FileLabelEntity;

  @Column({ name: 'question_id', type: 'uuid', nullable: false })
  questionId: string;

  @ManyToOne(() => LabelChecklistQuestionEntity, { nullable: false })
  @JoinColumn({ name: 'question_id' })
  question: LabelChecklistQuestionEntity;

  @Column({ name: 'answer_by_id', type: 'uuid', nullable: false })
  answerById: string;

  @ManyToOne(() => AccountEntity, { nullable: false })
  @JoinColumn({ name: 'answer_by_id' })
  answerBy: AccountEntity;

  @Column({ name: 'is_true', type: 'boolean', nullable: false })
  isTrue: boolean;
}
