import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileLabelController } from './file-label.controller';
import { FileLabelService } from './file-label.service';
import { FileLabelRepository } from './file-label.repository';
import { FileLabelEntity } from './file-label.entity';
import { FileModule } from '../file/file.module';
import { LabelModule } from '../label/label.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileLabelEntity]),
    FileModule,
    LabelModule,
  ],
  controllers: [FileLabelController],
  providers: [FileLabelService, FileLabelRepository],
  exports: [FileLabelService, FileLabelRepository],
})
export class FileLabelModule {}
