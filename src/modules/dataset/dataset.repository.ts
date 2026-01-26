import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatasetEntity } from './dataset.entity';
@Injectable()
export class DatasetRepository extends BaseRepository<DatasetEntity> {
  constructor(@InjectRepository(DatasetEntity)
      repository: Repository<DatasetEntity>,) {
    super(repository, DatasetEntity);
  }
}
