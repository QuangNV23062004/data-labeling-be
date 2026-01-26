import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewErrorEntity } from './review-error.entity';
@Injectable()
export class ReviewErrorRepository extends BaseRepository<ReviewErrorEntity> {
  constructor(@InjectRepository(ReviewErrorEntity)
      repository: Repository<ReviewErrorEntity>,) {
    super(repository, ReviewErrorEntity);
  }
}
