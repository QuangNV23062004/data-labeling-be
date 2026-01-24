import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LabelEntity } from './label.entity';
import { EntityManager } from 'typeorm/entity-manager/EntityManager';
import { In } from 'typeorm/find-options/operator/In';
import { FilterLabelQueryDto } from './dtos/filter-label-query.dto';
import { PaginationResultDto } from 'src/common/pagination/pagination-result.dto';
import unaccent from 'unaccent';
import { ILike } from 'typeorm/find-options/operator/ILike';
import { Not } from 'typeorm/find-options/operator/Not';
import { Repository } from 'typeorm';
import { BaseRepository } from 'src/common/repository/base.repository';

@Injectable()
export class LabelRepository extends BaseRepository<LabelEntity> {
  constructor(
    @InjectRepository(LabelEntity) repository: Repository<LabelEntity>,
  ) {
    super(repository, LabelEntity);
  }

  async FindByName(
    name: string,
    includeDeleted: boolean,
    excludeId?: string,
    entityManager?: EntityManager,
  ): Promise<LabelEntity | null> {
    const repository = await this.GetRepository(entityManager);
    let where: any = { name: ILike(`%${unaccent(name)}%`) };
    if (!includeDeleted) {
      where = { ...where, isDeleted: false };
    }
    if (excludeId) {
      where = { ...where, id: Not(excludeId) };
    }
    return repository.findOne({ where: where });
  }

  async Create(
    label: LabelEntity,
    entityManager?: EntityManager,
  ): Promise<LabelEntity> {
    const repository = await this.GetRepository(entityManager);
    return repository.save(label);
  }

  async FindById(
    id: string,
    includeDeleted: boolean,
    entityManager?: EntityManager,
  ): Promise<LabelEntity | null> {
    const repository = await this.GetRepository(entityManager);
    let where: any = { id: id };
    if (!includeDeleted) {
      where = { ...where, isDeleted: false };
    }
    return repository.findOne({ where: where, relations: ['categories'] });
  }

  async FindByIds(
    ids: string[],
    includeDeleted: boolean,
    entityManager?: EntityManager,
  ): Promise<LabelEntity[]> {
    const repository = await this.GetRepository(entityManager);
    let where: any = { id: In(ids) };
    if (!includeDeleted) {
      where = { ...where, isDeleted: false };
    }
    return repository.find({ where: where, relations: ['categories'] });
  }

  async FindAll(
    query: FilterLabelQueryDto,
    includeDeleted: boolean,
    entityManager?: EntityManager,
  ): Promise<LabelEntity[]> {
    const repository = await this.GetRepository(entityManager);
    const qb = repository.createQueryBuilder('label');

    // Always load categories
    qb.leftJoinAndSelect('label.categories', 'labelCategory');

    if (query?.search && query?.searchBy) {
      const searchField = `label.${query.searchBy}`;
      qb.andWhere(`${searchField} ILIKE :search`, {
        search: `%${query.search}%`,
      });
    }

    if (query?.orderBy && query?.order) {
      const orderField = `label.${query.orderBy}`;
      qb.orderBy(orderField, query.order.toUpperCase() as 'ASC' | 'DESC');
    }

    if (!includeDeleted) {
      qb.andWhere('label.is_deleted = :isDeleted', { isDeleted: false });
    }

    if (query?.categoryIds && query.categoryIds.length > 0) {
      qb.innerJoin(
        'label.categories',
        'category',
        'category.id IN (:...categoryIds)',
        {
          categoryIds: query.categoryIds,
        },
      );
    }

    return qb.getMany();
  }

  async FindPaginated(
    query: FilterLabelQueryDto,
    includeDeleted: boolean,
    entityManager?: EntityManager,
  ): Promise<PaginationResultDto<LabelEntity>> {
    const repository = await this.GetRepository(entityManager);
    const qb = repository.createQueryBuilder('label');

    // Always load categories
    qb.leftJoinAndSelect('label.categories', 'labelCategory');

    if (query?.search && query?.searchBy) {
      const searchField = `label.${query.searchBy}`;
      qb.andWhere(`${searchField} ILIKE :search`, {
        search: `%${query.search}%`,
      });
    }

    if (query?.orderBy && query?.order) {
      const orderField = `label.${query.orderBy}`;
      qb.orderBy(orderField, query.order.toUpperCase() as 'ASC' | 'DESC');
    }

    if (!includeDeleted) {
      qb.andWhere('label.is_deleted = :isDeleted', { isDeleted: false });
    }

    if (query?.categoryIds && query.categoryIds.length > 0) {
      qb.innerJoin(
        'label.categories',
        'category',
        'category.id IN (:...categoryIds)',
        {
          categoryIds: query.categoryIds,
        },
      );
    }

    const totalItems = await qb.getCount();

    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const offset = (page - 1) * limit;

    const items = await qb.skip(offset).take(limit).getMany();

    return new PaginationResultDto<LabelEntity>(
      items,
      Math.ceil(totalItems / limit),
      page,
      limit,
      query?.search || '',
      query?.searchBy || '',
      query?.order || '',
      query?.orderBy || '',
      page < Math.ceil(totalItems / limit),
      page > 1,
    );
  }

  async Update(
    label: LabelEntity,
    entityManager?: EntityManager,
  ): Promise<LabelEntity> {
    const repository = await this.GetRepository(entityManager);
    return repository.save(label);
  }

  async SoftDelete(
    id: string,
    entityManager?: EntityManager,
  ): Promise<boolean> {
    const repository = await this.GetRepository(entityManager);
    const result = await repository.update(id, { isDeleted: true });
    return (result?.affected ?? 0) > 0;
  }

  async Restore(id: string, entityManager?: EntityManager): Promise<boolean> {
    const repository = await this.GetRepository(entityManager);
    const result = await repository.update(id, { isDeleted: false });
    return (result?.affected ?? 0) > 0;
  }

  async HardDelete(
    id: string,
    entityManager?: EntityManager,
  ): Promise<boolean> {
    const repository = await this.GetRepository(entityManager);
    const result = await repository.delete(id);
    return (result?.affected ?? 0) > 0;
  }
}
