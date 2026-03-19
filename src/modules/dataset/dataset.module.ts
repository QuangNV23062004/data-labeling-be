import { Module } from '@nestjs/common';
import { DatasetController } from './dataset.controller';
import { DatasetService } from './dataset.service';
import { ProjectSnapshotModule } from '../project-snapshot/project-snapshot.module';
import { StorageModule } from 'src/common/storage/storage.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [ProjectSnapshotModule, StorageModule, AuthModule, NotificationModule],
  controllers: [DatasetController],
  providers: [DatasetService],
})
export class DatasetModule {}
