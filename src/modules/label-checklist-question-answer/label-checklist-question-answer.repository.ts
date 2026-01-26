import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LabelChecklistQuestionAnswerEntity } from './label-checklist-question-answer.entity';
@Injectable()
export class LabelChecklistQuestionAnswerRepository extends BaseRepository<LabelChecklistQuestionAnswerEntity> {
  constructor(@InjectRepository(LabelChecklistQuestionAnswerEntity)
      repository: Repository<LabelChecklistQuestionAnswerEntity>,) {
    super(repository, LabelChecklistQuestionAnswerEntity);
  }
}
