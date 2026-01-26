import { BaseEntity } from 'src/common/entity/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { AccountRatingEntity } from '../account-rating/account-rating.entity';

@Entity({ name: 'account_rating_history' })
@Index('idx_account_rating_id', ['accountRatingId'])
export class AccountRatingHistoryEntity extends BaseEntity {
  @Column({ name: 'account_rating_id', type: 'uuid', nullable: false })
  accountRatingId: string;

  @ManyToOne(() => AccountRatingEntity, (rating) => rating.id)
  @JoinColumn({ name: 'account_rating_id' })
  accountRating: AccountRatingEntity;

  @Column({ name: 'previous_rating_score', type: 'int', nullable: false })
  previousRatingScore: number;

  @Column({ name: 'new_rating_score', type: 'int', nullable: false })
  newRatingScore: number;

  @Column({ name: 'change_reason', type: 'text', nullable: true })
  changeReason: string;

  @Column({ name: 'changed_at', type: 'timestamptz', nullable: false })
  changedAt: Date;
}
