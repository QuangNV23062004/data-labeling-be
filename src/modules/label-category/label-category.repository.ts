import { InjectRepository } from '@nestjs/typeorm';
import { LabelCategoryEntity } from './label-category.entity';
import { Repository } from 'typeorm/repository/Repository';
import { EntityManager } from 'typeorm/entity-manager/EntityManager';
import { FilterLabelCategoryDto } from './dtos/filter-label-category.dto';
import { PaginationResultDto } from 'src/common/pagination/pagination-result.dto';
import { Injectable } from '@nestjs/common';
import { Not } from 'typeorm/find-options/operator/Not';
import { In } from 'typeorm/find-options/operator/In';
import unaccent from 'unaccent';
import { ILike } from 'typeorm/find-options/operator/ILike';
import { BaseRepository } from 'src/common/repository/base.repository';

@Injectable()
export class LabelCategoryRepository extends BaseRepository<LabelCategoryEntity> {
  constructor(
    @InjectRepository(LabelCategoryEntity)
    repository: Repository<LabelCategoryEntity>,
  ) {
    super(repository, LabelCategoryEntity);
  }

  async Create(
    labelCategory: LabelCategoryEntity,
    entityManager?: EntityManager,
  ): Promise<LabelCategoryEntity> {
    const repository = await this.GetRepository(entityManager);
    return repository.save(labelCategory);
  }

  async FindById(
    id: string,
    includeDeleted: boolean,
    entityManager?: EntityManager,
  ): Promise<LabelCategoryEntity | null> {
    const repository = await this.GetRepository(entityManager);
    const where: any = { id: id };
    if (!includeDeleted) {
      return repository.findOne({
        where: { ...where, isDeleted: false },
      });
    }
    return repository.findOne({ where: where });
  }

  async FindByIds(
    ids: string[],
    includeDeleted: boolean,
    entityManager?: EntityManager,
  ): Promise<LabelCategoryEntity[]> {
    const repository = await this.GetRepository(entityManager);
    const where: any = { id: In(ids) };
    if (!includeDeleted) {
      return repository.find({ where: { ...where, isDeleted: false } });
    }
    return repository.find({ where: where });
  }

  async FindAll(
    query: FilterLabelCategoryDto,
    includeDeleted: boolean,
    entityManager?: EntityManager,
  ): Promise<LabelCategoryEntity[]> {
    const repository = await this.GetRepository(entityManager);

    const qb = repository.createQueryBuilder('label_category');

    if (query?.search && query?.searchBy) {
      const searchField = `label_category.${query.searchBy}`;
      qb.andWhere(`${searchField} ILIKE :search`, {
        search: `%${query.search}%`,
      });
    }

    if (query?.order && query?.orderBy) {
      const orderField = `label_category.${query.orderBy}`;
      qb.orderBy(
        orderField,
        query.order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
      );
    }

    if (!includeDeleted) {
      qb.where('label_category.isDeleted = :isDeleted', { isDeleted: false });
    }

    return qb.getMany();
  }

  async FindByName(
    name: string,
    includeDeleted: boolean,
    excludeId?: string,
    entityManager?: EntityManager,
  ): Promise<LabelCategoryEntity | null> {
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

  async FindPaginated(
    query: FilterLabelCategoryDto,
    includeDeleted: boolean,
    entityManager?: EntityManager,
  ): Promise<PaginationResultDto<LabelCategoryEntity>> {
    const repository = await this.GetRepository(entityManager);

    const qb = repository.createQueryBuilder('label_category');

    if (query?.search && query?.searchBy) {
      const searchField = `label_category.${query.searchBy}`;
      qb.andWhere(`${searchField} ILIKE :search`, {
        search: `%${query.search}%`,
      });
    }

    if (query?.order && query?.orderBy) {
      const orderField = `label_category.${query.orderBy}`;
      qb.orderBy(
        orderField,
        query.order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
      );
    }

    if (!includeDeleted) {
      qb.where('label_category.isDeleted = :isDeleted', { isDeleted: false });
    }

    const totalItems = await qb.getCount();

    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const offset = (page - 1) * limit;

    const items = await qb.skip(offset).take(limit).getMany();

    return new PaginationResultDto<LabelCategoryEntity>(
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
    labelCategory: LabelCategoryEntity,
    entityManager?: EntityManager,
  ): Promise<LabelCategoryEntity> {
    const repository = await this.GetRepository(entityManager);
    return repository.save(labelCategory);
  }

  async SoftDelete(
    id: string,
    entityManager?: EntityManager,
  ): Promise<boolean> {
    const repository = await this.GetRepository(entityManager);
    const result = await repository.update(id, { isDeleted: true });
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

  async Restore(id: string, entityManager?: EntityManager): Promise<boolean> {
    const repository = await this.GetRepository(entityManager);
    const result = await repository.update(id, { isDeleted: false });
    return (result?.affected ?? 0) > 0;
  }
}
