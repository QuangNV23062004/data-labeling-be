import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Project } from "./Project";
import { Account } from "./Account";
import { FileLabel } from "./FileLabel";

@Index("file_pkey", ["id"], { unique: true })
@Entity("file", { schema: "public" })
export class File {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "uuid_generate_v4()",
  })
  id: string;

  @Column("character varying", { name: "file_name", length: 500 })
  fileName: string;

  @Column("character varying", {
    name: "content_type",
    nullable: true,
    length: 100,
  })
  contentType: string | null;

  @Column("text", { name: "url" })
  url: string;

  @Column("bigint", { name: "file_size", nullable: true })
  fileSize: string | null;

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

  @ManyToOne(() => Project, (project) => project.files, { onDelete: "CASCADE" })
  @JoinColumn([{ name: "project_id", referencedColumnName: "id" }])
  project: Project;

  @ManyToOne(() => Account, (account) => account.files)
  @JoinColumn([{ name: "uploaded_by", referencedColumnName: "id" }])
  uploadedBy: Account;

  @OneToMany(() => FileLabel, (fileLabel) => fileLabel.file)
  fileLabels: FileLabel[];
}
