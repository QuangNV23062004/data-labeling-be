import { BaseEntity } from 'src/common/entity/base.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { ProjectTaskEntity } from '../project-task/project-task.entity';
import { AccountEntity } from '../account/account.entity';
import { Decision } from './enums/decisions.enums';
import { ReviewErrorEntity } from '../review-error/review-error.entity';
import { ReviewChecklistSubmissionEntity } from '../review-checklist-submission/review-checklist-submission.entity';

@Entity({ name: 'reviews' })
@Index('idx_review_task_id', ['taskId'])
@Index('idx_review_reviewer_id', ['reviewerId'])
export class ReviewEntity extends BaseEntity {
  @Column({ name: 'task_id', type: 'uuid', nullable: false })
  taskId: string;

  @ManyToOne(() => ProjectTaskEntity, (task) => task.id)
  @JoinColumn({ name: 'task_id' })
  task: ProjectTaskEntity;

  @Column({ name: 'reviewer_id', type: 'uuid', nullable: false })
  reviewerId: string;

  @ManyToOne(() => AccountEntity, (account) => account.id)
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: AccountEntity;

  @Column({ name: 'decision', type: 'enum', enum: Decision, nullable: false })
  decision: Decision;

  @Column({ name: 'feedbacks', type: 'text', nullable: true })
  feedbacks: string;

  @Column({ name: 'reviewed_at', type: 'timestamptz', nullable: true })
  reviewedAt: Date;

  @OneToMany(() => ReviewErrorEntity, (reviewError) => reviewError.review)
  reviewErrors: ReviewErrorEntity[];

  @OneToMany(
    () => ReviewChecklistSubmissionEntity,
    (reviewChecklistSubmission) => reviewChecklistSubmission.review,
  )
  errors: ReviewChecklistSubmissionEntity[];
}
