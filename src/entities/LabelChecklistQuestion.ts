import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Account } from "./Account";
import { Label } from "./Label";
import { LabelChecklistQuestionAnswer } from "./LabelChecklistQuestionAnswer";

@Index("label_checklist_question_pkey", ["id"], { unique: true })
@Entity("label_checklist_question", { schema: "public" })
export class LabelChecklistQuestion {
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

  @Column("uuid", { name: "label_checklist_question_id", nullable: true })
  labelChecklistQuestionId: string | null;

  @Column("integer", { name: "role_enum", default: () => "0" })
  roleEnum: number;

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

  @ManyToOne(() => Account, (account) => account.labelChecklistQuestions)
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy: Account;

  @ManyToOne(() => Label, (label) => label.labelChecklistQuestions)
  @JoinColumn([{ name: "label_id", referencedColumnName: "id" }])
  label: Label;

  @OneToMany(
    () => LabelChecklistQuestionAnswer,
    (labelChecklistQuestionAnswer) => labelChecklistQuestionAnswer.question
  )
  labelChecklistQuestionAnswers: LabelChecklistQuestionAnswer[];
}
