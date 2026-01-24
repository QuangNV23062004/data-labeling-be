import { Column, Entity, Index, OneToMany } from "typeorm";
import { AccountRating } from "./AccountRating";
import { Dataset } from "./Dataset";
import { File } from "./File";
import { FileLabel } from "./FileLabel";
import { Label } from "./Label";
import { LabelCategory } from "./LabelCategory";
import { LabelChecklistQuestion } from "./LabelChecklistQuestion";
import { LabelChecklistQuestionAnswer } from "./LabelChecklistQuestionAnswer";
import { LabelPreset } from "./LabelPreset";
import { NotificationEntity } from "./NotificationEntity";
import { Project } from "./Project";
import { ProjectSnapshot } from "./ProjectSnapshot";
import { ProjectTask } from "./ProjectTask";
import { Review } from "./Review";
import { ReviewChecklistSubmission } from "./ReviewChecklistSubmission";

@Index("account_email_key", ["email"], { unique: true })
@Index("account_pkey", ["id"], { unique: true })
@Entity("account", { schema: "public" })
export class Account {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "uuid_generate_v4()",
  })
  id: string;

  @Column("character varying", { name: "email", unique: true, length: 255 })
  email: string;

  @Column("character varying", { name: "password_hash", length: 255 })
  passwordHash: string;

  @Column("character varying", { name: "password_salt", length: 255 })
  passwordSalt: string;

  @Column("integer", { name: "role_enum" })
  roleEnum: number;

  @Column("character varying", {
    name: "full_name",
    nullable: true,
    length: 255,
  })
  fullName: string | null;

  @Column("boolean", {
    name: "is_active",
    nullable: true,
    default: () => "true",
  })
  isActive: boolean | null;

  @Column("timestamp without time zone", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column("timestamp without time zone", {
    name: "updated_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;

  @Column("timestamp without time zone", { name: "deleted_at", nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => AccountRating, (accountRating) => accountRating.account)
  accountRatings: AccountRating[];

  @OneToMany(() => Dataset, (dataset) => dataset.createdBy)
  datasets: Dataset[];

  @OneToMany(() => File, (file) => file.uploadedBy)
  files: File[];

  @OneToMany(() => FileLabel, (fileLabel) => fileLabel.annotator)
  fileLabels: FileLabel[];

  @OneToMany(() => Label, (label) => label.createdBy)
  labels: Label[];

  @OneToMany(() => LabelCategory, (labelCategory) => labelCategory.createdBy)
  labelCategories: LabelCategory[];

  @OneToMany(
    () => LabelChecklistQuestion,
    (labelChecklistQuestion) => labelChecklistQuestion.createdBy
  )
  labelChecklistQuestions: LabelChecklistQuestion[];

  @OneToMany(
    () => LabelChecklistQuestionAnswer,
    (labelChecklistQuestionAnswer) =>
      labelChecklistQuestionAnswer.answeredByAccount
  )
  labelChecklistQuestionAnswers: LabelChecklistQuestionAnswer[];

  @OneToMany(() => LabelPreset, (labelPreset) => labelPreset.createdBy)
  labelPresets: LabelPreset[];

  @OneToMany(
    () => NotificationEntity,
    (notificationEntity) => notificationEntity.account
  )
  notificationEntities: NotificationEntity[];

  @OneToMany(() => Project, (project) => project.createdBy)
  projects: Project[];

  @OneToMany(
    () => ProjectSnapshot,
    (projectSnapshot) => projectSnapshot.createdBy
  )
  projectSnapshots: ProjectSnapshot[];

  @OneToMany(() => ProjectTask, (projectTask) => projectTask.assignedBy)
  projectTasks: ProjectTask[];

  @OneToMany(() => ProjectTask, (projectTask) => projectTask.assignedTo)
  projectTasks2: ProjectTask[];

  @OneToMany(() => Review, (review) => review.reviewer)
  reviews: Review[];

  @OneToMany(
    () => ReviewChecklistSubmission,
    (reviewChecklistSubmission) => reviewChecklistSubmission.submittedBy
  )
  reviewChecklistSubmissions: ReviewChecklistSubmission[];
}
