import { BaseEntity } from 'src/common/entity/base.entity';
import { Column, Entity, Index, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { ProjectEntity } from '../project/project.entity';
import { LabelEntity } from '../label/label.entity';
import { LabelCategoryEntity } from '../label-category/label-category.entity';
import { LabelPresetEntity } from '../label-preset/label-preset.entity';
import { LabelChecklistQuestionEntity } from '../label-checklist-question/label-checklist-question.entity';
import { Role } from './enums/role.enum';
import { Status } from './enums/account-status.enum';
import { FileEntity } from '../file/file.entity';
import { FileLabelEntity } from '../file-label/file-label.entity';
import { ProjectTaskEntity } from '../project-task/project-task.entity';
import { ReviewEntity } from '../review/review.entity';
import { NotificationEntity } from '../notification/notification.entity';

@Entity('accounts')
@Index('IDX_ACCOUNT_EMAIL', ['email'])
export class AccountEntity extends BaseEntity {
  @Column({ name: 'username' })
  username: string;

  @Column({ name: 'email', unique: true })
  email: string;

  @Exclude()
  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Exclude()
  @Column({ name: 'password_salt' })
  passwordSalt: string;

  @Column({ name: 'role', type: 'enum', enum: Role, default: Role.ANNOTATOR })
  role: Role;

  @Column({
    name: 'status',
    type: 'enum',
    enum: Status,
    default: Status.ACTIVE,
  })
  status: Status;

  @OneToMany(() => FileEntity, (file) => file.uploadedBy)
  files: FileEntity[];

  @OneToMany(() => FileLabelEntity, (fileLabel) => fileLabel.annotator)
  fileLabels: FileLabelEntity[];

  @OneToMany(() => ProjectTaskEntity, (task) => task.assignedToAccount)
  assignedTasks: ProjectTaskEntity[];

  @OneToMany(() => ReviewEntity, (review) => review.reviewer)
  reviews: ReviewEntity[];

  @OneToMany(() => NotificationEntity, (notification) => notification.account)
  notifications: NotificationEntity[];
}
