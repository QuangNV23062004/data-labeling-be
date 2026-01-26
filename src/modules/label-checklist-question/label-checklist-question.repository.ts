import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LabelChecklistQuestionEntity } from './label-checklist-question.entity';
@Injectable()
export class LabelChecklistQuestionRepository extends BaseRepository<LabelChecklistQuestionEntity> {
  constructor(
    @InjectRepository(LabelChecklistQuestionEntity)
    repository: Repository<LabelChecklistQuestionEntity>,
  ) {
    super(repository, LabelChecklistQuestionEntity);
  }
}
