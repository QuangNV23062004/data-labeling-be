import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Account } from "./Account";
import { Project } from "./Project";
import { AccountRatingHistory } from "./AccountRatingHistory";

@Index("account_rating_pkey", ["id"], { unique: true })
@Entity("account_rating", { schema: "public" })
export class AccountRating {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "uuid_generate_v4()",
  })
  id: string;

  @Column("integer", { name: "rating_score", nullable: true })
  ratingScore: number | null;

  @Column("integer", {
    name: "error_count",
    nullable: true,
    default: () => "0",
  })
  errorCount: number | null;

  @Column("integer", {
    name: "total_annotations",
    nullable: true,
    default: () => "0",
  })
  totalAnnotations: number | null;

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

  @ManyToOne(() => Account, (account) => account.accountRatings)
  @JoinColumn([{ name: "account_id", referencedColumnName: "id" }])
  account: Account;

  @ManyToOne(() => Project, (project) => project.accountRatings)
  @JoinColumn([{ name: "project_id", referencedColumnName: "id" }])
  project: Project;

  @OneToMany(
    () => AccountRatingHistory,
    (accountRatingHistory) => accountRatingHistory.accountRating
  )
  accountRatingHistories: AccountRatingHistory[];
}
