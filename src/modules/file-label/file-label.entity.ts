import { BaseEntity } from 'src/common/entity/base.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { FileEntity } from '../file/file.entity';
import { LabelEntity } from '../label/label.entity';
import { AccountEntity } from '../account/account.entity';
import { FileLabelStatusEnums } from './enums/file-label.enums';
import { LabelChecklistQuestionAnswerEntity } from '../label-checklist-question-answer/label-checklist-question-answer.entity';

@Entity({ name: 'file_labels' })
@Index('idx_file_id', ['fileId'])
@Index('idx_label_id', ['labelId'])
@Index('idx_annotator_id', ['annotatorId'])
@Index('idx_reviewer_id', ['reviewerId'])
@Index('idx_status', ['status'])
export class FileLabelEntity extends BaseEntity {
  @Column({ name: 'file_id', type: 'uuid', nullable: false })
  fileId: string;

  @ManyToOne(() => FileEntity, (file) => file.id)
  @JoinColumn({ name: 'file_id' })
  file: FileEntity;

  @Column({ name: 'label_id', type: 'uuid', nullable: false })
  labelId: string;

  @ManyToOne(() => LabelEntity, (label) => label.id)
  @JoinColumn({ name: 'label_id' })
  label: LabelEntity;

  @Column({ name: 'annotator_id', type: 'uuid', nullable: false })
  annotatorId: string;

  @ManyToOne(() => AccountEntity, (account) => account.id)
  @JoinColumn({ name: 'annotator_id' })
  annotator: AccountEntity;

  // if store annotator, may be store reviewer too
  @Column({ name: 'reviewer_id', type: 'uuid', nullable: true })
  reviewerId: string;

  @ManyToOne(() => AccountEntity, (account) => account.id)
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: AccountEntity;

  @Column({
    name: 'status',
    type: 'enum',
    enum: FileLabelStatusEnums,
    nullable: false,
    default: FileLabelStatusEnums.DRAFT,
  })
  status: FileLabelStatusEnums;

  @OneToMany(
    () => LabelChecklistQuestionAnswerEntity,
    (labelchecklistanswer) => labelchecklistanswer.fileLabel,
  )
  checklistAnswers: LabelChecklistQuestionAnswerEntity[];
}
