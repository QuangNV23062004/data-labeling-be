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
import { Review } from "./Review";

@Index("project_task_pkey", ["id"], { unique: true })
@Entity("project_task", { schema: "public" })
export class ProjectTask {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "uuid_generate_v4()",
  })
  id: string;

  @Column("uuid", { name: "file_ids", array: true })
  fileIds: string[];

  @Column("integer", { name: "status_enum", default: () => "0" })
  statusEnum: number;

  @Column("timestamp without time zone", {
    name: "assigned_at",
    nullable: true,
  })
  assignedAt: Date | null;

  @Column("timestamp without time zone", { name: "started_at", nullable: true })
  startedAt: Date | null;

  @Column("timestamp without time zone", {
    name: "submitted_at",
    nullable: true,
  })
  submittedAt: Date | null;

  @Column("timestamp without time zone", {
    name: "completed_at",
    nullable: true,
  })
  completedAt: Date | null;

  @Column("integer", {
    name: "priority_enum",
    nullable: true,
    default: () => "1",
  })
  priorityEnum: number | null;

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

  @ManyToOne(() => Account, (account) => account.projectTasks)
  @JoinColumn([{ name: "assigned_by", referencedColumnName: "id" }])
  assignedBy: Account;

  @ManyToOne(() => Account, (account) => account.projectTasks2)
  @JoinColumn([{ name: "assigned_to", referencedColumnName: "id" }])
  assignedTo: Account;

  @ManyToOne(() => Project, (project) => project.projectTasks, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "project_id", referencedColumnName: "id" }])
  project: Project;

  @OneToMany(() => Review, (review) => review.task)
  reviews: Review[];
}
