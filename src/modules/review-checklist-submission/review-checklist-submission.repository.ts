import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewChecklistSubmissionEntity } from './review-checklist-submission.entity';
@Injectable()
export class ReviewChecklistSubmissionRepository extends BaseRepository<ReviewChecklistSubmissionEntity> {
  constructor(@InjectRepository(ReviewChecklistSubmissionEntity)
      repository: Repository<ReviewChecklistSubmissionEntity>,) {
    super(repository, ReviewChecklistSubmissionEntity);
  }
}
