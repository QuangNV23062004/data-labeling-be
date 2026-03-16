import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LabelPresetEntity } from './label-preset.entity';
import { EntityManager, ILike, In, Not, Repository } from 'typeorm';
import unaccent from 'unaccent';
import { FilterLabelPresetQueryDto } from './dtos/filter-label-preset-query.dto';
import { PaginationResultDto } from 'src/common/pagination/pagination-result.dto';
import { BaseRepository } from 'src/common/repository/base.repository';
import { LabelEntity } from '../label/label.entity';
import { LabelPresetStatisticsDto } from './dtos/label-preset-statistics.dto';

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
    const qb = repository.createQueryBuilder('labelPreset');
    qb.where('labelPreset.name ILIKE :name', { name: `%${unaccent(name)}%` });
    if (!includeDeleted) {
      qb.andWhere('labelPreset.deletedAt IS NULL');
      qb.leftJoinAndSelect(
        'labelPreset.labels',
        'label',
        'label.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'label.categories',
        'category',
        'category.deletedAt IS NULL',
      );
    } else {
      qb.leftJoinAndSelect('labelPreset.labels', 'label');
      qb.leftJoinAndSelect('label.categories', 'category');
    }
    if (excludeId) {
      qb.andWhere('labelPreset.id != :excludeId', { excludeId });
    }
    return qb.getOne();
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
      qb.andWhere('labelPreset.deletedAt IS NULL');
      qb.leftJoinAndSelect(
        'labelPreset.labels',
        'label',
        'label.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'label.categories',
        'category',
        'category.deletedAt IS NULL',
      );
    } else {
      qb.leftJoinAndSelect('labelPreset.labels', 'label');
      qb.leftJoinAndSelect('label.categories', 'category');
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
      qb.andWhere('labelPreset.deletedAt IS NULL');
      qb.leftJoinAndSelect(
        'labelPreset.labels',
        'label',
        'label.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'label.categories',
        'category',
        'category.deletedAt IS NULL',
      );
    } else {
      qb.leftJoinAndSelect('labelPreset.labels', 'label');
      qb.leftJoinAndSelect('label.categories', 'category');
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
    const qb = repository.createQueryBuilder('labelPreset');
    if (!includeDeleted) {
      qb.andWhere('labelPreset.deletedAt IS NULL');
      qb.leftJoinAndSelect(
        'labelPreset.labels',
        'label',
        'label.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'label.categories',
        'category',
        'category.deletedAt IS NULL',
      );
    } else {
      qb.leftJoinAndSelect('labelPreset.labels', 'label');
      qb.leftJoinAndSelect('label.categories', 'category');
    }

    return qb.andWhere('labelPreset.id = :id', { id }).getOne();
  }

  async FindByIds(
    ids: string[],
    includeDeleted: boolean,
    entityManager?: EntityManager,
  ) {
    if (ids.length === 0) {
      return [];
    }
    const repository = await this.GetRepository(entityManager);
    const qb = repository.createQueryBuilder('labelPreset');
    if (!includeDeleted) {
      qb.andWhere('labelPreset.deletedAt IS NULL');
      qb.leftJoinAndSelect(
        'labelPreset.labels',
        'label',
        'label.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'label.categories',
        'category',
        'category.deletedAt IS NULL',
      );
    } else {
      qb.leftJoinAndSelect('labelPreset.labels', 'label');
      qb.leftJoinAndSelect('label.categories', 'category');
    }

    return qb.andWhere('labelPreset.id IN (:...ids)', { ids }).getMany();
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
    const result = await repository.update(id, { deletedAt: new Date() });
    return (result?.affected as number) > 0;
  }

  async Restore(id: string, entityManager?: EntityManager): Promise<boolean> {
    const repository = await this.GetRepository(entityManager);
    const result = await repository.update(id, { deletedAt: null });
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

  async GetStatistics(
    createdById?: string,
    entityManager?: EntityManager,
  ): Promise<LabelPresetStatisticsDto> {
    const repository = await this.GetRepository(entityManager);
    const qb = repository.createQueryBuilder('labelPreset');

    qb.select('COUNT(DISTINCT labelPreset.id)', 'totalPresets')
      .addSelect(
        'COUNT(DISTINCT CASE WHEN label.id IS NOT NULL THEN labelPreset.id END)',
        'presetsWithLabels',
      )
      .addSelect(
        'COUNT(DISTINCT CASE WHEN label.id IS NOT NULL THEN label.id END)',
        'distinctLabels',
      )
      .addSelect(
        'COUNT(CASE WHEN label.id IS NOT NULL THEN 1 END)',
        'presetLabelLinks',
      )
      .leftJoin(
        'label_presets_mapping',
        'mapping',
        'mapping.preset_id = labelPreset.id',
      )
      .leftJoin(
        LabelEntity,
        'label',
        'label.id = mapping.label_id AND label.deletedAt IS NULL',
      )
      .where('labelPreset.deletedAt IS NULL');

    if (createdById) {
      qb.andWhere('labelPreset.createdById = :createdById', { createdById });
    }

    const raw = await qb.getRawOne<{
      totalPresets: string;
      presetsWithLabels: string;
      distinctLabels: string;
      presetLabelLinks: string;
    }>();

    const totalPresets = Number(raw?.totalPresets ?? 0);
    const presetsWithLabels = Number(raw?.presetsWithLabels ?? 0);
    const distinctLabels = Number(raw?.distinctLabels ?? 0);
    const presetLabelLinks = Number(raw?.presetLabelLinks ?? 0);

    return {
      totalPresets,
      presetsWithLabels,
      avgLabelsPerPreset:
        totalPresets > 0 ? presetLabelLinks / totalPresets : 0,
      avgPresetsPerLabel:
        distinctLabels > 0 ? presetLabelLinks / distinctLabels : 0,
    };
  }
}
