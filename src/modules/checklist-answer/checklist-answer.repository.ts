import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChecklistAnswerEntity } from './checklist-answer.entity';
@Injectable()
export class ChecklistAnswerRepository extends BaseRepository<ChecklistAnswerEntity> {
  constructor(@InjectRepository(ChecklistAnswerEntity)
      repository: Repository<ChecklistAnswerEntity>,) {
    super(repository, ChecklistAnswerEntity);
  }
}
