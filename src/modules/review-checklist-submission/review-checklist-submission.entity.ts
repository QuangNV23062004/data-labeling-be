import { BaseEntity } from 'src/common/entity/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { ReviewEntity } from '../review/review.entity';
import { AccountEntity } from '../account/account.entity';

@Entity({ name: 'review_checklist_submissions' })
@Index('idx_reviewchecklistsubmission_review_id', ['reviewId'])
export class ReviewChecklistSubmissionEntity extends BaseEntity {
  @Column({ name: 'review_id', type: 'uuid', nullable: false })
  reviewId: string;

  @ManyToOne(() => ReviewEntity, (review) => review.id)
  @JoinColumn({ name: 'review_id' })
  review: ReviewEntity;

  @Column({ name: 'checklist_data', type: 'jsonb', nullable: false })
  checklistData: any;

  @Column({ name: 'submitted_by', type: 'uuid', nullable: false })
  submittedBy: string;

  @ManyToOne(() => AccountEntity, (account) => account.id)
  @JoinColumn({ name: 'submitted_by' })
  submittedByAccount: AccountEntity;
}
