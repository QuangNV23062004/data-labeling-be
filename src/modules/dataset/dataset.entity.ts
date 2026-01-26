import { BaseEntity } from 'src/common/entity/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { ExportFormat } from './enums/export-format.enums';
import { AccountEntity } from '../account/account.entity';

//question: is this needed or snapshot is enough
@Entity({ name: 'datasets' })
@Index('IDX_DATASET_SNAPSHOT_ID', ['snapshotId'])
@Index('IDX_DATASET_CREATED_BY_ID', ['createdById'])
export class DatasetEntity extends BaseEntity {
  @Column({ name: 'snapshot_id', type: 'uuid', nullable: false })
  snapshotId: string;

  //question: why need version of dataset when snapshot has version already
  @Column({ name: 'version', type: 'varchar', nullable: false })
  version: string;

  @Column({
    name: 'export_format_enum',
    type: 'enum',
    enum: ExportFormat,
    nullable: false,
    default: ExportFormat.JSON,
  })
  exportFormatEnum: ExportFormat;

  @Column({ name: 'export_config', type: 'jsonb', nullable: true })
  exportConfig: any;

  @Column({ name: 'dataset_data', type: 'jsonb', nullable: true })
  datasetData: any;

  //question: so we store zip files in server for user to download? => heavy and not scalable, when we already have files on cloud
  @Column({ name: 'download_url', type: 'varchar', nullable: true })
  downloadUrl: string;

  //question: how do we know if we stream line from cloud
  @Column({ name: 'file_size', type: 'bigint', nullable: true })
  fileSize: number;

  @Column({ name: 'created_by_id', type: 'uuid', nullable: false })
  createdById: string;

  @ManyToOne(() => AccountEntity, (acc) => acc.id)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: AccountEntity;
}
