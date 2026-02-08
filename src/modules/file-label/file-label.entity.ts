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
import { Role } from '../account/enums/role.enum';
import { ChecklistAnswerEntity } from '../checklist-answer/checklist-answer.entity';

@Entity({ name: 'file_labels' })
@Index('idx_file_id', ['fileId'])
@Index('idx_label_id', ['labelId'])
@Index('idx_annotator_id', ['annotatorId'])
@Index('idx_reviewer_id', ['reviewerId'])
@Index('idx_status', ['status'])
@Index('idx_unique_file_label', ['fileId', 'labelId'], { unique: true })
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

  // for future scale if need
  @Column({ name: 'annotation_data', type: 'jsonb', nullable: true })
  annotationData: any;

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
    default: FileLabelStatusEnums.IN_PROGRESS,
  })
  status: FileLabelStatusEnums;

  @OneToMany(
    () => ChecklistAnswerEntity,
    (checklistAnswer) => checklistAnswer.fileLabel,
  )
  checklistAnswers: ChecklistAnswerEntity[];
}
