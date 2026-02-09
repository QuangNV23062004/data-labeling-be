import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/common/entity/base.entity';
import { FileLabelEntity } from '../file-label/file-label.entity';
import { AnswerTypeEnum } from './enums/answer-type.enums';
import { Role } from '../account/enums/role.enum';
import { AccountEntity } from '../account/account.entity';
import { AnswerData } from './interface/answer-data.interface';

@Entity('checklist_answers')
@Index('idx_checklistanswers_file_label_id', ['fileLabelId'])
@Index('idx_checklistanswers_answer_by_id', ['answerById'])
@Index('idx_checklistanswers_role_type', ['roleType'])
@Index(
  'idx_unique_attempt_role',
  ['fileLabelId', 'labelAttemptNumber', 'roleType'],
  { unique: true },
)
export class ChecklistAnswerEntity extends BaseEntity {
  @Column({ name: 'file_label_id', type: 'uuid', nullable: false })
  fileLabelId: string;

  @ManyToOne(() => FileLabelEntity, { nullable: false })
  @JoinColumn({ name: 'file_label_id' })
  fileLabel: FileLabelEntity;

  @Column({ name: 'answer_data', type: 'jsonb', nullable: true })
  answerData: AnswerData;

  @Column({ name: 'label_attempt_number', type: 'int', nullable: false })
  labelAttemptNumber: number;

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
}
