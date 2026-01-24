import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { ReviewErrorType } from "./ReviewErrorType";
import { Review } from "./Review";

@Index("review_error_pkey", ["id"], { unique: true })
@Entity("review_error", { schema: "public" })
export class ReviewError {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "uuid_generate_v4()",
  })
  id: string;

  @Column("jsonb", { name: "error_location", nullable: true })
  errorLocation: object | null;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("timestamp without time zone", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @ManyToOne(
    () => ReviewErrorType,
    (reviewErrorType) => reviewErrorType.reviewErrors
  )
  @JoinColumn([{ name: "error_type_id", referencedColumnName: "id" }])
  errorType: ReviewErrorType;

  @ManyToOne(() => Review, (review) => review.reviewErrors, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "review_id", referencedColumnName: "id" }])
  review: Review;
}
