import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewEntity } from './review.entity';
@Injectable()
export class ReviewRepository extends BaseRepository<ReviewEntity> {
  constructor(@InjectRepository(ReviewEntity)
      repository: Repository<ReviewEntity>,) {
    super(repository, ReviewEntity);
  }
}
