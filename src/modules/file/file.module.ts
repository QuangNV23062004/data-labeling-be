import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { FileRepository } from './file.repository';
import { FileEntity } from './file.entity';
import { StorageModule } from 'src/common/storage/storage.module';
import { ProjectModule } from '../project/project.module';
import { FileDomain } from './file.domain';
import { AccountModule } from '../account/account.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileEntity]),
    StorageModule,
    ProjectModule,
    AccountModule,
  ],
  controllers: [FileController],
  providers: [FileService, FileRepository, FileDomain],
  exports: [FileService, FileRepository, FileDomain],
})
export class FileModule {}
