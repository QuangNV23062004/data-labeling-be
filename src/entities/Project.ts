import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { AccountRating } from "./AccountRating";
import { File } from "./File";
import { Account } from "./Account";
import { ProjectConfiguration } from "./ProjectConfiguration";
import { ProjectInstruction } from "./ProjectInstruction";
import { ProjectSnapshot } from "./ProjectSnapshot";
import { ProjectTask } from "./ProjectTask";

@Index("project_pkey", ["id"], { unique: true })
@Entity("project", { schema: "public" })
export class Project {
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

  @Column("integer", { name: "data_type_enum" })
  dataTypeEnum: number;

  @Column("text", { name: "image_url", nullable: true })
  imageUrl: string | null;

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

  @OneToMany(() => AccountRating, (accountRating) => accountRating.project)
  accountRatings: AccountRating[];

  @OneToMany(() => File, (file) => file.project)
  files: File[];

  @ManyToOne(() => Account, (account) => account.projects)
  @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
  createdBy: Account;

  @OneToMany(
    () => ProjectConfiguration,
    (projectConfiguration) => projectConfiguration.project
  )
  projectConfigurations: ProjectConfiguration[];

  @OneToMany(
    () => ProjectInstruction,
    (projectInstruction) => projectInstruction.project
  )
  projectInstructions: ProjectInstruction[];

  @OneToMany(
    () => ProjectSnapshot,
    (projectSnapshot) => projectSnapshot.project
  )
  projectSnapshots: ProjectSnapshot[];

  @OneToMany(() => ProjectTask, (projectTask) => projectTask.project)
  projectTasks: ProjectTask[];
}
