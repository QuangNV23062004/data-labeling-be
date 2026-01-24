import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Review } from "./Review";
import { Account } from "./Account";

@Index("review_checklist_submission_pkey", ["id"], { unique: true })
@Entity("review_checklist_submission", { schema: "public" })
export class ReviewChecklistSubmission {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "uuid_generate_v4()",
  })
  id: string;

  @Column("jsonb", { name: "checklist_data" })
  checklistData: object;

  @Column("timestamp without time zone", {
    name: "submitted_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  submittedAt: Date;

  @Column("timestamp without time zone", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @ManyToOne(() => Review, (review) => review.reviewChecklistSubmissions, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "review_id", referencedColumnName: "id" }])
  review: Review;

  @ManyToOne(() => Account, (account) => account.reviewChecklistSubmissions)
  @JoinColumn([{ name: "submitted_by", referencedColumnName: "id" }])
  submittedBy: Account;
}
