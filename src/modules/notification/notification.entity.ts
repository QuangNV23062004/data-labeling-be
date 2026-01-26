import { BaseEntity } from 'src/common/entity/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { AccountEntity } from '../account/account.entity';
import { NotificationType } from './enums/notification-types.enums';

@Entity({ name: 'notifications' })
@Index('idx_notification_account_id', ['accountId'])
@Index('idx_notification_notification_type', ['notificationType'])
export class NotificationEntity extends BaseEntity {
  @Column({ name: 'account_id', type: 'uuid', nullable: false })
  accountId: string;

  @ManyToOne(() => AccountEntity, (account) => account.id)
  @JoinColumn({ name: 'account_id' })
  account: AccountEntity;

  @Column({
    name: 'notification_type',
    type: 'enum',
    enum: NotificationType,
    nullable: false,
  })
  notificationType: NotificationType;

  @Column({ name: 'title', type: 'text', nullable: false })
  title: string;

  @Column({ name: 'content', type: 'text', nullable: false })
  content: string;

  @Column({ name: 'related_entity_id', type: 'uuid', nullable: true })
  relatedEntityId: string | null;

  @Column({ name: 'additional_data', type: 'jsonb', nullable: true })
  additionalData: Record<string, any> | null;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;

  @Column({ name: 'read_at', type: 'timestamptz', nullable: true })
  readAt: Date;
}
