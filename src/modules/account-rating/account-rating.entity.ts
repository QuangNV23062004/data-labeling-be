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
import { AccountEntity } from '../account/account.entity';
import { ProjectEntity } from '../project/project.entity';
import { AccountRatingHistoryEntity } from '../account-rating-history/account-rating-history.entity';

@Entity({ name: 'account_ratings' })
@Index('idx_accountrating_account_id', ['accountId'])
@Index('idx_accountrating_project_id', ['projectId'])
//at project completion
export class AccountRatingEntity extends BaseEntity {
  @Column({ name: 'account_id', type: 'uuid', nullable: false })
  accountId: string;

  @ManyToOne(() => AccountEntity, (account) => account.id)
  @JoinColumn({ name: 'account_id' })
  account: AccountEntity;

  @Column({ name: 'project_id', type: 'uuid', nullable: false })
  projectId: string;

  @ManyToOne(() => ProjectEntity, (project) => project.id) // Changed to ManyToOne
  @JoinColumn({ name: 'project_id' })
  project: ProjectEntity;

  @Column({ name: 'rating_score', type: 'int', nullable: false })
  ratingScore: number;

  @Column({ name: 'error_count', type: 'int', default: 0 })
  errorCount: number;

  @Column({ name: 'total_file_labeled', type: 'int', default: 0 })
  totalFileLabeled: number;

  @Column({ name: 'feedbacks', type: 'text', nullable: true })
  feedbacks: string;

  @OneToMany(
    () => AccountRatingHistoryEntity,
    (history) => history.accountRating,
  )
  history: AccountRatingHistoryEntity[];
}
