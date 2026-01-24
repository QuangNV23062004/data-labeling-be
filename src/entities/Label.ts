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
import { LabelChecklistQuestion } from "./LabelChecklistQuestion";

@Index("label_pkey", ["id"], { unique: true })
@Entity("label", { schema: "public" })
export class Label {
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

  @Column("uuid", { name: "category_ids", nullable: true, array: true })
  categoryIds: string[] | null;

  @Column("character varying", { name: "color", nullable: true, length: 7 })
  color: string | null;

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

  @OneToMany(() => FileLabel, (fileLabel) => fileLabel.label)
  fileLabels: FileLabel[];

  @ManyToOne(() => Account, (account) => account.labels)
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy: Account;

  @OneToMany(
    () => LabelChecklistQuestion,
    (labelChecklistQuestion) => labelChecklistQuestion.label
  )
  labelChecklistQuestions: LabelChecklistQuestion[];
}
