import { Column, Entity, Index, OneToMany } from "typeorm";
import { ReviewError } from "./ReviewError";

@Index("review_error_type_pkey", ["id"], { unique: true })
@Entity("review_error_type", { schema: "public" })
export class ReviewErrorType {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "uuid_generate_v4()",
  })
  id: string;

  @Column("character varying", { name: "name", length: 255 })
  name: string;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("integer", { name: "severity_enum" })
  severityEnum: number;

  @Column("integer", { name: "score_impact", nullable: true })
  scoreImpact: number | null;

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

  @OneToMany(() => ReviewError, (reviewError) => reviewError.errorType)
  reviewErrors: ReviewError[];
}
