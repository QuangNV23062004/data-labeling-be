import { BaseEntity } from 'src/common/entity/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { ReviewEntity } from '../review/review.entity';
@Entity({ name: 'review_errors' })
@Index('idx_reviewerror_review_id', ['reviewId'])
@Index('idx_reviewerror_review_error_type_id', ['reviewErrorTypeId'])
export class ReviewErrorEntity extends BaseEntity {
  @Column({ name: 'review_id', type: 'uuid', nullable: false })
  reviewId: string;

  @ManyToOne(() => ReviewEntity, (review) => review.id)
  @JoinColumn({ name: 'review_id' })
  review: ReviewEntity;

  @Column({ name: 'review_error_type_id', type: 'uuid', nullable: false })
  reviewErrorTypeId: string;

  //this is for annotation & tool => ignore
  // @Column({ name: 'error_location', type: 'jsonb', nullable: true })
  // errorLocation: any;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;
}
