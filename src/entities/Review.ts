import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { FileLabel } from "./FileLabel";
import { Account } from "./Account";
import { ProjectTask } from "./ProjectTask";
import { ReviewChecklistSubmission } from "./ReviewChecklistSubmission";
import { ReviewError } from "./ReviewError";

@Index("review_pkey", ["id"], { unique: true })
@Entity("review", { schema: "public" })
export class Review {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "uuid_generate_v4()",
  })
  id: string;

  @Column("integer", { name: "decision_enum" })
  decisionEnum: number;

  @Column("text", { name: "feedback", nullable: true })
  feedback: string | null;

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

  @Column("timestamp without time zone", {
    name: "reviewed_at",
    nullable: true,
  })
  reviewedAt: Date | null;

  @ManyToOne(() => FileLabel, (fileLabel) => fileLabel.reviews)
  @JoinColumn([{ name: "annotation_id", referencedColumnName: "id" }])
  annotation: FileLabel;

  @ManyToOne(() => Account, (account) => account.reviews)
  @JoinColumn([{ name: "reviewer_id", referencedColumnName: "id" }])
  reviewer: Account;

  @ManyToOne(() => ProjectTask, (projectTask) => projectTask.reviews, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "task_id", referencedColumnName: "id" }])
  task: ProjectTask;

  @OneToMany(
    () => ReviewChecklistSubmission,
    (reviewChecklistSubmission) => reviewChecklistSubmission.review
  )
  reviewChecklistSubmissions: ReviewChecklistSubmission[];

  @OneToMany(() => ReviewError, (reviewError) => reviewError.review)
  reviewErrors: ReviewError[];
}
