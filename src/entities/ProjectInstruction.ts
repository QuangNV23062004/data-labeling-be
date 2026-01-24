import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Project } from "./Project";

@Index("project_instruction_pkey", ["id"], { unique: true })
@Entity("project_instruction", { schema: "public" })
export class ProjectInstruction {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "uuid_generate_v4()",
  })
  id: string;

  @Column("character varying", { name: "title", nullable: true, length: 255 })
  title: string | null;

  @Column("text", { name: "content", nullable: true })
  content: string | null;

  @Column("text", { name: "attachment_url", nullable: true })
  attachmentUrl: string | null;

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

  @ManyToOne(() => Project, (project) => project.projectInstructions, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "project_id", referencedColumnName: "id" }])
  project: Project;
}
