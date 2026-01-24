import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { AccountRating } from "./AccountRating";

@Index("account_rating_history_pkey", ["id"], { unique: true })
@Entity("account_rating_history", { schema: "public" })
export class AccountRatingHistory {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "uuid_generate_v4()",
  })
  id: string;

  @Column("integer", { name: "previous_rating_score", nullable: true })
  previousRatingScore: number | null;

  @Column("integer", { name: "new_rating_score", nullable: true })
  newRatingScore: number | null;

  @Column("text", { name: "change_reason", nullable: true })
  changeReason: string | null;

  @Column("timestamp without time zone", {
    name: "changed_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  changedAt: Date;

  @ManyToOne(
    () => AccountRating,
    (accountRating) => accountRating.accountRatingHistories,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "account_rating_id", referencedColumnName: "id" }])
  accountRating: AccountRating;
}
