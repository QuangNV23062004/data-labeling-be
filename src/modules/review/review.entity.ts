import { BaseEntity } from 'src/common/entity/base.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { ProjectTaskEntity } from '../project-task/project-task.entity';
import { AccountEntity } from '../account/account.entity';
import { Decision } from './enums/decisions.enums';
import { ReviewErrorEntity } from '../review-error/review-error.entity';
import { FileLabelEntity } from '../file-label/file-label.entity';
import { ChecklistAnswerEntity } from '../checklist-answer/checklist-answer.entity';

@Entity({ name: 'reviews' })
@Index('idx_review_file_label_id', ['fileLabelId'])
@Index('idx_review_checklist_answer_id', ['checklistAnswerId'])
@Index('idx_review_file_label_id_checklist_answer_id', [
  'fileLabelId',
  'checklistAnswerId',
])
@Index('idx_review_reviewer_id', ['reviewerId'])
export class ReviewEntity extends BaseEntity {
  @Column({ name: 'file_label_id', type: 'uuid', nullable: false })
  fileLabelId: string;

  @ManyToOne(() => FileLabelEntity)
  @JoinColumn({ name: 'file_label_id' })
  fileLabel: FileLabelEntity;

  @Column({ name: 'reviewer_id', type: 'uuid', nullable: false })
  reviewerId: string;

  @ManyToOne(() => AccountEntity)
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: AccountEntity;

  @Column({ name: 'decision', type: 'enum', enum: Decision, nullable: false })
  decision: Decision;

  @Column({ name: 'feedbacks', type: 'text', nullable: true })
  feedbacks: string;

  @Column({ name: 'reviewed_at', type: 'timestamptz', nullable: true })
  reviewedAt: Date;

  @Column({ name: 'checklist_answer_id', type: 'uuid', nullable: true })
  checklistAnswerId: string;

  @OneToOne(() => ChecklistAnswerEntity)
  @JoinColumn({ name: 'checklist_answer_id' })
  checklistAnswer: ChecklistAnswerEntity;

  @OneToMany(() => ReviewErrorEntity, (reviewError) => reviewError.review)
  reviewErrors: ReviewErrorEntity[];
}
