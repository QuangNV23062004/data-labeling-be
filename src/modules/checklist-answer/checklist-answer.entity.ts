import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/common/entity/base.entity';
import { FileLabelEntity } from '../file-label/file-label.entity';
import { AnswerTypeEnum } from './enums/answer-type.enums';
import { Role } from '../account/enums/role.enum';
import { AccountEntity } from '../account/account.entity';
import { AnswerData } from './interface/answer-data.interface';

@Entity('label_checklist_question_answers')
@Index('idx_labelchecklistquestionanswer_file_label_id', ['fileLabelId'])
@Index('idx_labelchecklistquestionanswer_answer_by_id', ['answerById'])
@Entity('checklist-answers')
export class ChecklistAnswerEntity extends BaseEntity {
  @Column({ name: 'file_label_id', type: 'uuid', nullable: false })
  fileLabelId: string;

  @ManyToOne(() => FileLabelEntity, { nullable: false })
  @JoinColumn({ name: 'file_label_id' })
  fileLabel: FileLabelEntity;

  @Column({ name: 'answer_data', type: 'jsonb', nullable: true })
  answerData: AnswerData;

  @Column({ name: 'round', type: 'int', nullable: false })
  round: number;

  @Column({
    name: 'answer_type',
    type: 'enum',
    enum: AnswerTypeEnum,
    nullable: false,
  })
  answerType: AnswerTypeEnum;

  @Column({
    name: 'role_type',
    type: 'enum',
    enum: [Role.ANNOTATOR, Role.REVIEWER],
    nullable: false,
  })
  roleType: Role;

  @Column({ name: 'answer_by_id', type: 'uuid', nullable: false })
  answerById: string;

  @ManyToOne(() => AccountEntity, { nullable: false })
  @JoinColumn({ name: 'answer_by_id' })
  answerBy: AccountEntity;

  @Column({ name: 'is_true', type: 'boolean', nullable: false })
  isTrue: boolean;
}
