import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Account } from "./Account";
import { ProjectSnapshot } from "./ProjectSnapshot";

@Index("dataset_pkey", ["id"], { unique: true })
@Entity("dataset", { schema: "public" })
export class Dataset {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "uuid_generate_v4()",
  })
  id: string;

  @Column("character varying", { name: "version", nullable: true, length: 50 })
  version: string | null;

  @Column("character varying", {
    name: "export_format_enum",
    nullable: true,
    length: 50,
  })
  exportFormatEnum: string | null;

  @Column("jsonb", { name: "export_config", nullable: true })
  exportConfig: object | null;

  @Column("jsonb", { name: "dataset_data", nullable: true })
  datasetData: object | null;

  @Column("text", { name: "download_url", nullable: true })
  downloadUrl: string | null;

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

  @Column("timestamp without time zone", {
    name: "exported_at",
    nullable: true,
  })
  exportedAt: Date | null;

  @ManyToOne(() => Account, (account) => account.datasets)
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy: Account;

  @ManyToOne(
    () => ProjectSnapshot,
    (projectSnapshot) => projectSnapshot.datasets
  )
  @JoinColumn([{ name: "snapshot_id", referencedColumnName: "id" }])
  snapshot: ProjectSnapshot;
}
