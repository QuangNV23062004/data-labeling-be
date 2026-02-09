import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { LabelChecklistQuestionEntity } from './label-checklist-question.entity';
import { FilterLabelChecklistQuestionQueryDto } from './dtos/filter-label-checklist-question-query.dto';
import { PaginationResultDto } from 'src/common/pagination/pagination-result.dto';
@Injectable()
export class LabelChecklistQuestionRepository extends BaseRepository<LabelChecklistQuestionEntity> {
  constructor(
    @InjectRepository(LabelChecklistQuestionEntity)
    repository: Repository<LabelChecklistQuestionEntity>,
  ) {
    super(repository, LabelChecklistQuestionEntity);
  }

  async FindAll(
    query: FilterLabelChecklistQuestionQueryDto,
    includeDeleted: boolean,
    em?: EntityManager,
  ) {
    const repository = await this.GetRepository(em);
    const qb = repository.createQueryBuilder('label_checklist_question');

    if (query?.search && query?.searchBy) {
      qb.andWhere(
        `label_checklist_question.${query.searchBy} ILIKE unaccent(:search)`,
        {
          search: `%${query.search}%`,
        },
      );
    }

    if (query?.order && query?.orderBy) {
      qb.orderBy(
        `label_checklist_question.${query.orderBy}`,
        query.order.toUpperCase() as 'ASC' | 'DESC',
      );
    }

    if (query?.labelId) {
      qb.andWhere(`label_checklist_question.labelId = :labelId`, {
        labelId: query.labelId,
      });
    }

    if (query?.role) {
      qb.andWhere(`label_checklist_question.roleEnum = :role`, {
        role: query.role,
      });
    }

    if (!includeDeleted) {
      qb.andWhere(`label_checklist_question.deletedAt IS NULL`);
      qb.leftJoinAndSelect(
        'label_checklist_question.label',
        'label',
        'label.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'label.categories',
        'categories',
        'categories.deletedAt IS NULL',
      );
    } else {
      qb.leftJoinAndSelect('label_checklist_question.label', 'label');
      qb.leftJoinAndSelect('label.categories', 'categories');
    }

    if (query?.isRequired !== undefined) {
      qb.andWhere(`label_checklist_question.isRequired = :isRequired`, {
        isRequired: query.isRequired,
      });
    }

    return await qb.getMany();
  }

  async FindPaginated(
    query: FilterLabelChecklistQuestionQueryDto,
    includeDeleted: boolean,
    em?: EntityManager,
  ): Promise<PaginationResultDto<LabelChecklistQuestionEntity>> {
    const repository = await this.GetRepository(em);
    const qb = repository.createQueryBuilder('label_checklist_question');

    if (query?.search && query?.searchBy) {
      qb.andWhere(
        `label_checklist_question.${query.searchBy} ILIKE unaccent(:search)`,
        {
          search: `%${query.search}%`,
        },
      );
    }

    if (query?.order && query?.orderBy) {
      qb.orderBy(
        `label_checklist_question.${query.orderBy}`,
        query.order.toUpperCase() as 'ASC' | 'DESC',
      );
    }

    if (query?.labelId) {
      qb.andWhere(`label_checklist_question.labelId = :labelId`, {
        labelId: query.labelId,
      });
    }

    if (query?.role) {
      qb.andWhere(`label_checklist_question.roleEnum = :role`, {
        role: query.role,
      });
    }

    if (!includeDeleted) {
      qb.andWhere(`label_checklist_question.deletedAt IS NULL`);
      qb.leftJoinAndSelect(
        'label_checklist_question.label',
        'label',
        'label.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'label.categories',
        'categories',
        'categories.deletedAt IS NULL',
      );
    } else {
      qb.leftJoinAndSelect('label_checklist_question.label', 'label');
      qb.leftJoinAndSelect('label.categories', 'categories');
    }

    if (query?.isRequired !== undefined) {
      qb.andWhere(`label_checklist_question.isRequired = :isRequired`, {
        isRequired: query.isRequired,
      });
    }

    const total = await qb.getCount();

    const safePage = query?.page ?? 1;
    const safeLimit = query?.limit ?? 10;
    const offset = (safePage - 1) * safeLimit;
    const items = await qb.skip(offset).take(safeLimit).getMany();

    const totalPage = Math.ceil(total / safeLimit);
    return new PaginationResultDto<LabelChecklistQuestionEntity>(
      items,
      totalPage,
      safePage,
      safeLimit,
      query?.search || '',
      query?.searchBy || 'name',
      query?.order || 'DESC',
      query?.orderBy || 'createdAt',
      safePage < totalPage,
      safePage > 1,
    );
  }

  async FindById(
    id: string,
    includeDeleted: boolean,
    em?: EntityManager,
  ): Promise<LabelChecklistQuestionEntity | null> {
    const repository = await this.GetRepository(em);
    const qb = repository.createQueryBuilder('label_checklist_question');

    qb.where('label_checklist_question.id = :id', { id });

    if (!includeDeleted) {
      qb.andWhere(`label_checklist_question.deletedAt IS NULL`);
      qb.leftJoinAndSelect(
        'label_checklist_question.label',
        'label',
        'label.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'label.categories',
        'categories',
        'categories.deletedAt IS NULL',
      );
    } else {
      qb.leftJoinAndSelect('label_checklist_question.label', 'label');
      qb.leftJoinAndSelect('label.categories', 'categories');
    }

    return await qb.getOne();
  }

  async FindByIds(
    ids: string[],
    includeDeleted: boolean,
    em?: EntityManager,
  ): Promise<LabelChecklistQuestionEntity[]> {
    const repository = await this.GetRepository(em);
    const qb = repository.createQueryBuilder('label_checklist_question');

    qb.where('label_checklist_question.id IN (:...ids)', { ids });

    if (!includeDeleted) {
      qb.andWhere(`label_checklist_question.deletedAt IS NULL`);
      qb.leftJoinAndSelect(
        'label_checklist_question.label',
        'label',
        'label.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'label.categories',
        'categories',
        'categories.deletedAt IS NULL',
      );
    } else {
      qb.leftJoinAndSelect('label_checklist_question.label', 'label');
      qb.leftJoinAndSelect('label.categories', 'categories');
    }

    return await qb.getMany();
  }

  async Create(
    data: LabelChecklistQuestionEntity,
    em?: EntityManager,
  ): Promise<LabelChecklistQuestionEntity> {
    const repository = await this.GetRepository(em);
    return await repository.save(data);
  }

  async Update(
    data: LabelChecklistQuestionEntity,
    em?: EntityManager,
  ): Promise<LabelChecklistQuestionEntity> {
    const repository = await this.GetRepository(em);
    return await repository.save(data);
  }

  async SoftDelete(id: string, em?: EntityManager): Promise<boolean> {
    const repository = await this.GetRepository(em);
    const result = await repository.update(id, { deletedAt: new Date() });
    return result?.affected !== undefined && result?.affected > 0;
  }

  async HardDelete(id: string, em?: EntityManager): Promise<boolean> {
    const repository = await this.GetRepository(em);
    const result = await repository.delete(id);
    return result?.affected !== undefined && (result?.affected as number) > 0;
  }

  async Restore(id: string, em?: EntityManager): Promise<boolean> {
    const repository = await this.GetRepository(em);
    const result = await repository.update(id, { deletedAt: null });
    return result?.affected !== undefined && result?.affected > 0;
  }
}
