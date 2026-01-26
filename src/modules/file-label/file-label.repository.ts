import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileLabelEntity } from './file-label.entity';
@Injectable()
export class FileLabelRepository extends BaseRepository<FileLabelEntity> {
  constructor(@InjectRepository(FileLabelEntity)
      repository: Repository<FileLabelEntity>,) {
    super(repository, FileLabelEntity);
  }
}
