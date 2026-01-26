import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileLabelController } from './file-label.controller';
import { FileLabelService } from './file-label.service';
import { FileLabelRepository } from './file-label.repository';
import { FileLabelEntity } from './file-label.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FileLabelEntity])],
  controllers: [FileLabelController],
  providers: [FileLabelService, FileLabelRepository],
})
export class FileLabelModule {}
