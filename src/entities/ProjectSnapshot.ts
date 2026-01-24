import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Dataset } from "./Dataset";
import { Account } from "./Account";
import { Project } from "./Project";

@Index("project_snapshot_pkey", ["id"], { unique: true })
@Entity("project_snapshot", { schema: "public" })
export class ProjectSnapshot {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "uuid_generate_v4()",
  })
  id: string;

  @Column("character varying", { name: "version", length: 50 })
  version: string;

  @Column("character varying", { name: "name", nullable: true, length: 255 })
  name: string | null;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("jsonb", { name: "snapshot_data" })
  snapshotData: object;

  @Column("integer", {
    name: "total_files",
    nullable: true,
    default: () => "0",
  })
  totalFiles: number | null;

  @Column("timestamp without time zone", {
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column("timestamp without time zone", { name: "deleted_at", nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => Dataset, (dataset) => dataset.snapshot)
  datasets: Dataset[];

  @ManyToOne(() => Account, (account) => account.projectSnapshots)
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy: Account;

  @ManyToOne(() => Project, (project) => project.projectSnapshots, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "project_id", referencedColumnName: "id" }])
  project: Project;
}
