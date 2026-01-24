import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LabelPresetEntity } from './label-preset.entity';
import { EntityManager, ILike, In, Not, Repository } from 'typeorm';
import unaccent from 'unaccent';
import { FilterLabelPresetQueryDto } from './dtos/filter-label-preset-query.dto';
import { PaginationResultDto } from 'src/common/pagination/pagination-result.dto';
import { BaseRepository } from 'src/common/repository/base.repository';

@Injectable()
export class LabelPresetRepository extends BaseRepository<LabelPresetEntity> {
  constructor(
    @InjectRepository(LabelPresetEntity)
    repository: Repository<LabelPresetEntity>,
  ) {
    super(repository, LabelPresetEntity);
  }

  async FindByName(
    name: string,
    includeDeleted: boolean,
    excludeId?: string,
    entityManager?: EntityManager,
  ): Promise<LabelPresetEntity | null> {
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

  async Create(labelPreset: LabelPresetEntity, entityManager?: EntityManager) {
    const repository = await this.GetRepository(entityManager);
    return repository.save(labelPreset);
  }

  async FindAll(
    query: FilterLabelPresetQueryDto,
    includeDeleted: boolean,
    entityManager?: EntityManager,
  ) {
    const repository = await this.GetRepository(entityManager);

    const qb = repository.createQueryBuilder('labelPreset');

    // Join relations first so they can be used in WHERE clauses
    qb.leftJoinAndSelect('labelPreset.labels', 'label');
    qb.leftJoinAndSelect('label.categories', 'categories');

    if (query?.search && query?.searchBy) {
      qb.andWhere(`labelPreset.${query.searchBy} ILIKE :search`, {
        search: `%${query.search}%`,
      });
    }
    if (query?.orderBy && query?.order) {
      qb.orderBy(`labelPreset.${query.orderBy}`, query.order as 'ASC' | 'DESC');
    }

    if (query?.labelIds && query?.labelIds?.length > 0) {
      qb.andWhere('label.id IN (:...labelIds)', {
        labelIds: query.labelIds,
      });
    }

    if (!includeDeleted) {
      qb.andWhere('labelPreset.isDeleted = :isDeleted', {
        isDeleted: false,
      });
    }

    return qb.getMany();
  }

  async FindPaginated(
    query: FilterLabelPresetQueryDto,
    includeDeleted: boolean,
    entityManager?: EntityManager,
  ): Promise<PaginationResultDto<LabelPresetEntity>> {
    const repository = await this.GetRepository(entityManager);

    const qb = repository.createQueryBuilder('labelPreset');

    // Join relations first so they can be used in WHERE clauses
    qb.leftJoinAndSelect('labelPreset.labels', 'label');
    qb.leftJoinAndSelect('label.categories', 'categories');

    if (query?.search && query?.searchBy) {
      qb.andWhere(`labelPreset.${query.searchBy} ILIKE :search`, {
        search: `%${query.search}%`,
      });
    }
    if (query?.orderBy && query?.order) {
      qb.orderBy(`labelPreset.${query.orderBy}`, query.order as 'ASC' | 'DESC');
    }

    if (query?.labelIds && query?.labelIds?.length > 0) {
      qb.andWhere('label.id IN (:...labelIds)', {
        labelIds: query.labelIds,
      });
    }

    if (!includeDeleted) {
      qb.andWhere('labelPreset.isDeleted = :isDeleted', {
        isDeleted: false,
      });
    }

    const totalItems = await qb.getCount();

    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const offset = (page - 1) * limit;

    const items = await qb.skip(offset).take(limit).getMany();

    return new PaginationResultDto<LabelPresetEntity>(
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

  async FindById(
    id: string,
    includeDeleted: boolean,
    entityManager?: EntityManager,
  ) {
    const repository = await this.GetRepository(entityManager);
    let where: any = { id };
    if (!includeDeleted) {
      where = { ...where, isDeleted: false };
    }
    return repository.findOne({
      where: where,
      relations: ['labels', 'labels.categories'],
    });
  }

  async FindByIds(
    ids: string[],
    includeDeleted: boolean,
    entityManager?: EntityManager,
  ) {
    const repository = await this.GetRepository(entityManager);
    let where: any = { id: In(ids) };
    if (!includeDeleted) {
      where = { ...where, isDeleted: false };
    }
    return repository.find({
      where: where,
      relations: ['labels', 'labels.categories'],
    });
  }

  async Update(
    labelPreset: LabelPresetEntity,
    entityManager?: EntityManager,
  ): Promise<LabelPresetEntity> {
    const repository = await this.GetRepository(entityManager);
    return repository.save(labelPreset);
  }

  async SoftDelete(
    id: string,
    entityManager?: EntityManager,
  ): Promise<boolean> {
    const repository = await this.GetRepository(entityManager);
    const result = await repository.update(id, { isDeleted: true });
    return (result?.affected as number) > 0;
  }

  async Restore(id: string, entityManager?: EntityManager): Promise<boolean> {
    const repository = await this.GetRepository(entityManager);
    const result = await repository.update(id, { isDeleted: false });
    return (result?.affected as number) > 0;
  }

  async HardDelete(
    id: string,
    entityManager?: EntityManager,
  ): Promise<boolean> {
    const repository = await this.GetRepository(entityManager);
    const result = await repository.delete(id);
    return (result?.affected as number) > 0;
  }
}
