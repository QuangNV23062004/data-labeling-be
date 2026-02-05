import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EntityManager,
  FindOptionsWhere,
  In,
  IsNull,
  Repository,
} from 'typeorm';
import { ChecklistAnswerEntity } from './checklist-answer.entity';
import { FilterChecklistAnswerQueryDto } from './dtos/filter-checklist-answer-query.dto';
import { PaginationResultDto } from 'src/common/pagination/pagination-result.dto';
import { Role } from '../account/enums/role.enum';
import { AnswerTypeEnum } from './enums/answer-type.enums';
@Injectable()
export class ChecklistAnswerRepository extends BaseRepository<ChecklistAnswerEntity> {
  constructor(
    @InjectRepository(ChecklistAnswerEntity)
    repository: Repository<ChecklistAnswerEntity>,
  ) {
    super(repository, ChecklistAnswerEntity);
  }
  async FindByIds(
    ids: string[],
    includeDeleted: boolean = false,
    em?: EntityManager,
  ): Promise<ChecklistAnswerEntity[]> {
    let whereClause: FindOptionsWhere<ChecklistAnswerEntity> = {
      id: In(ids),
    };
    const repository = await this.GetRepository(em);

    if (!includeDeleted) {
      whereClause = { ...whereClause, deletedAt: IsNull() };
    }
    return repository.find({ where: whereClause });
  }

  async FindById(
    id: string,
    includeDeleted: boolean = false,
    em?: EntityManager,
  ): Promise<ChecklistAnswerEntity | null> {
    let whereClause: FindOptionsWhere<ChecklistAnswerEntity> = { id };
    const repository = await this.GetRepository(em);

    if (!includeDeleted) {
      whereClause = { ...whereClause, deletedAt: IsNull() };
    }

    return repository.findOne({ where: whereClause });
  }

  async FindAll(
    query: FilterChecklistAnswerQueryDto,
    includeDeleted: boolean = false,
    em?: EntityManager,
  ): Promise<ChecklistAnswerEntity[]> {
    const repository = await this.GetRepository(em);

    const qb = await repository.createQueryBuilder('checklist_answer');

    if (!includeDeleted) {
      qb.leftJoinAndSelect(
        'checklist_answer.fileLabel',
        'file_label',
        'file_label.deletedAt IS NULL',
      );
      qb.andWhere('checklist_answer.deletedAt IS NULL');
    } else {
      qb.leftJoinAndSelect('checklist_answer.fileLabel', 'file_label');
    }

    if (query?.fileLabelId) {
      qb.andWhere('file_label = :fileLabelId', {
        fileLabelId: query.fileLabelId,
      });
    }

    if (query?.labelAttemptNumber) {
      qb.andWhere(
        'checklist_answer.label_attempt_number = :labelAttemptNumber',
        {
          labelAttemptNumber: query.labelAttemptNumber,
        },
      );
    }

    if (query?.answerById) {
      qb.andWhere('checklist_answer.answer_by_id = :answerById', {
        answerById: query.answerById,
      });
    }

    if (query?.answerType) {
      qb.andWhere('checklist_answer.answer_type = :answerType', {
        answerType: query.answerType,
      });
    }

    if (query?.roleType) {
      qb.andWhere('checklist_answer.role_type = :roleType', {
        roleType: query.roleType,
      });
    }

    return await qb.getMany();
  }

  async FindPaginated(
    query: FilterChecklistAnswerQueryDto,
    includeDeleted: boolean = false,
    em?: EntityManager,
  ): Promise<PaginationResultDto<ChecklistAnswerEntity>> {
    const repository = await this.GetRepository(em);

    const qb = await repository.createQueryBuilder('checklist_answer');

    if (!includeDeleted) {
      qb.leftJoinAndSelect(
        'checklist_answer.fileLabel',
        'file_label',
        'file_label.deletedAt IS NULL',
      );
      qb.andWhere('checklist_answer.deletedAt IS NULL');
    } else {
      qb.leftJoinAndSelect('checklist_answer.fileLabel', 'file_label');
    }

    if (query?.fileLabelId) {
      qb.andWhere('file_label = :fileLabelId', {
        fileLabelId: query.fileLabelId,
      });
    }

    if (query?.labelAttemptNumber) {
      qb.andWhere(
        'checklist_answer.label_attempt_number = :labelAttemptNumber',
        {
          labelAttemptNumber: query.labelAttemptNumber,
        },
      );
    }

    if (query?.answerById) {
      qb.andWhere('checklist_answer.answer_by_id = :answerById', {
        answerById: query.answerById,
      });
    }

    if (query?.answerType) {
      qb.andWhere('checklist_answer.answer_type = :answerType', {
        answerType: query.answerType,
      });
    }

    if (query?.roleType) {
      qb.andWhere('checklist_answer.role_type = :roleType', {
        roleType: query.roleType,
      });
    }

    const totalItems = await qb.getCount();

    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const offset = (page - 1) * limit;

    const items = await qb.skip(offset).take(limit).getMany();

    return new PaginationResultDto<ChecklistAnswerEntity>(
      items,
      Math.ceil(totalItems / limit),
      page,
      limit,
      'Search not implement for ChecklistAnswerEntity',
      'Search by not implement for ChecklistAnswerEntity',
      query?.order || '',
      query?.orderBy || '',
      page < Math.ceil(totalItems / limit),
      page > 1,
      {
        fileLabelId: query?.fileLabelId,
        labelAttemptNumber: query?.labelAttemptNumber,
        answerById: query?.answerById,
        answerType: query?.answerType,
        roleType: query?.roleType,
      },
    );
  }

  async Create(
    data: ChecklistAnswerEntity,
    em?: EntityManager,
  ): Promise<ChecklistAnswerEntity> {
    const repository = await this.GetRepository(em);
    const entity = repository.create(data);
    return repository.save(entity);
  }

  async CreateBulk(
    data: ChecklistAnswerEntity[],
    em?: EntityManager,
  ): Promise<ChecklistAnswerEntity[]> {
    const repository = await this.GetRepository(em);
    const entities = repository.create(data);
    return repository.save(entities);
  }

  async Update(
    data: ChecklistAnswerEntity,
    em?: EntityManager,
  ): Promise<ChecklistAnswerEntity> {
    const repository = await this.GetRepository(em);
    return repository.save(data);
  }

  async SoftDelete(id: string, em?: EntityManager): Promise<boolean> {
    const repository = await this.GetRepository(em);
    const result = await repository.update(id, { deletedAt: new Date() });
    return (result.affected ?? 0) > 0;
  }

  async Restore(id: string, em?: EntityManager): Promise<boolean> {
    const repository = await this.GetRepository(em);
    const result = await repository.update(id, { deletedAt: null });
    return (result.affected ?? 0) > 0;
  }

  async HardDelete(id: string, em?: EntityManager): Promise<boolean> {
    const repository = await this.GetRepository(em);
    const result = await repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async GetLatestAttemptedLabelCounts(
    fileLabelIds: string[],
    em?: EntityManager,
  ): Promise<{
    round: number;
    role: Role | null;
    type: AnswerTypeEnum | null;
  }> {
    const repository = await this.GetRepository(em);

    const qb = repository.createQueryBuilder('checklist_answer');

    qb.select('checklist_answer.file_label_id', 'fileLabelId')
      .where('checklist_answer.file_label_id IN (:...fileLabelIds)', {
        fileLabelIds,
      })
      .andWhere('checklist_answer.deletedAt IS NULL')
      .groupBy('checklist_answer.file_label_id');

    const result = await qb.getOne();
    const round = result ? result.labelAttemptNumber : 0;
    const role = result ? result.roleType : null;
    const type = result ? result.answerType : null;

    return { round, role, type };
  }
}
