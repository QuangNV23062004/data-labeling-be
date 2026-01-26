import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewErrorTypeEntity } from './review-error-type.entity';
@Injectable()
export class ReviewErrorTypeRepository extends BaseRepository<ReviewErrorTypeEntity> {
  constructor(@InjectRepository(ReviewErrorTypeEntity)
      repository: Repository<ReviewErrorTypeEntity>,) {
    super(repository, ReviewErrorTypeEntity);
  }
}
