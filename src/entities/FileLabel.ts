import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Account } from "./Account";
import { File } from "./File";
import { Label } from "./Label";
import { LabelChecklistQuestionAnswer } from "./LabelChecklistQuestionAnswer";
import { Review } from "./Review";

@Index("file_label_pkey", ["id"], { unique: true })
@Entity("file_label", { schema: "public" })
export class FileLabel {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "uuid_generate_v4()",
  })
  id: string;

  @Column("jsonb", { name: "annotation_data" })
  annotationData: object;

  @Column("integer", { name: "status_enum", default: () => "0" })
  statusEnum: number;

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

  @ManyToOne(() => Account, (account) => account.fileLabels)
  @JoinColumn([{ name: "annotator_id", referencedColumnName: "id" }])
  annotator: Account;

  @ManyToOne(() => File, (file) => file.fileLabels)
  @JoinColumn([{ name: "file_id", referencedColumnName: "id" }])
  file: File;

  @ManyToOne(() => Label, (label) => label.fileLabels)
  @JoinColumn([{ name: "label_id", referencedColumnName: "id" }])
  label: Label;

  @OneToMany(
    () => LabelChecklistQuestionAnswer,
    (labelChecklistQuestionAnswer) => labelChecklistQuestionAnswer.fileLabel
  )
  labelChecklistQuestionAnswers: LabelChecklistQuestionAnswer[];

  @OneToMany(() => Review, (review) => review.annotation)
  reviews: Review[];
}
