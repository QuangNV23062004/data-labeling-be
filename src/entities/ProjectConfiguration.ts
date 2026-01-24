import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Project } from "./Project";

@Index("project_configuration_pkey", ["id"], { unique: true })
@Entity("project_configuration", { schema: "public" })
export class ProjectConfiguration {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "uuid_generate_v4()",
  })
  id: string;

  @Column("uuid", { name: "available_label_ids", array: true })
  availableLabelIds: string[];

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

  @ManyToOne(() => Project, (project) => project.projectConfigurations, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "project_id", referencedColumnName: "id" }])
  project: Project;
}
