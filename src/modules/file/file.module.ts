import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { FileRepository } from './file.repository';
import { FileEntity } from './file.entity';
import { StorageModule } from 'src/common/storage/storage.module';
import { ProjectModule } from '../project/project.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileEntity]),
    StorageModule,
    ProjectModule,
  ],
  controllers: [FileController],
  providers: [FileService, FileRepository],
  exports: [FileService, FileRepository],
})
export class FileModule {}
