import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Account } from "./Account";
import { FileLabel } from "./FileLabel";
import { LabelChecklistQuestion } from "./LabelChecklistQuestion";

@Index("label_checklist_question_answer_pkey", ["id"], { unique: true })
@Entity("label_checklist_question_answer", { schema: "public" })
export class LabelChecklistQuestionAnswer {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "uuid_generate_v4()",
  })
  id: string;

  @Column("boolean", { name: "istrue" })
  istrue: boolean;

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

  @ManyToOne(() => Account, (account) => account.labelChecklistQuestionAnswers)
  @JoinColumn([{ name: "answered_by_account_id", referencedColumnName: "id" }])
  answeredByAccount: Account;

  @ManyToOne(
    () => FileLabel,
    (fileLabel) => fileLabel.labelChecklistQuestionAnswers,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "file_label_id", referencedColumnName: "id" }])
  fileLabel: FileLabel;

  @ManyToOne(
    () => LabelChecklistQuestion,
    (labelChecklistQuestion) =>
      labelChecklistQuestion.labelChecklistQuestionAnswers,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "question_id", referencedColumnName: "id" }])
  question: LabelChecklistQuestion;
}
