import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Account } from "./Account";

@Index("notification_entity_pkey", ["id"], { unique: true })
@Entity("notification_entity", { schema: "public" })
export class NotificationEntity {
  @Column("uuid", {
    primary: true,
    name: "id",
    default: () => "uuid_generate_v4()",
  })
  id: string;

  @Column("integer", { name: "notification_type_enum" })
  notificationTypeEnum: number;

  @Column("character varying", { name: "title", nullable: true, length: 255 })
  title: string | null;

  @Column("text", { name: "content" })
  content: string;

  @Column("character varying", {
    name: "related_entity_type",
    nullable: true,
    length: 50,
  })
  relatedEntityType: string | null;

  @Column("uuid", { name: "related_entity_id", nullable: true })
  relatedEntityId: string | null;

  @Column("jsonb", { name: "additional_data", nullable: true })
  additionalData: object | null;

  @Column("boolean", {
    name: "is_read",
    nullable: true,
    default: () => "false",
  })
  isRead: boolean | null;

  @Column("timestamp without time zone", { name: "read_at", nullable: true })
  readAt: Date | null;

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

  @ManyToOne(() => Account, (account) => account.notificationEntities, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "account_id", referencedColumnName: "id" }])
  account: Account;
}
