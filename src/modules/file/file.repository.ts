import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity } from './file.entity';
@Injectable()
export class FileRepository extends BaseRepository<FileEntity> {
  constructor(
    @InjectRepository(FileEntity)
    repository: Repository<FileEntity>,
  ) {
    super(repository, FileEntity);
  }
}
