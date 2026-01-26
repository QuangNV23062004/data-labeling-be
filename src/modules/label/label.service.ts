import { Injectable } from '@nestjs/common';
import { LabelRepository } from './label.repository';
import { LabelCategoryRepository } from '../label-category/label-category.repository';
import { CreateLabelDto } from './dtos/create-label.dto';
import { LabelEntity } from './label.entity';
import { LabelException } from './exceptions/label-exceptions.exceptions';
import { AccountInfo } from 'src/interfaces/request';
import { Role } from '../account/enums/role.enum';
import { FilterLabelQueryDto } from './dtos/filter-label-query.dto';
import { PaginationResultDto } from 'src/common/pagination/pagination-result.dto';
import { UpdateLabelDto } from './dtos/update-label.dto';
import { BaseService } from 'src/common/service/base.service';

@Injectable()
export class LabelService extends BaseService {
  constructor(
    private readonly labelRepository: LabelRepository,
    private readonly labelCategoryRepository: LabelCategoryRepository,
  ) {
    super();
  }

  async Create(
    createLabelDto: CreateLabelDto,
    accountInfo?: AccountInfo,
  ): Promise<LabelEntity> {
    const em = await this.labelRepository.GetEntityManager();

    return em.transaction(async (transactionalEntityManager) => {
      const existingLabel = await this.labelRepository.FindByName(
        createLabelDto.name,
        false,
        undefined,
        transactionalEntityManager,
      );
      if (existingLabel) {
        throw LabelException.LABEL_NAME_ALREADY_EXISTED;
      }

      const labelCategory = await this.labelCategoryRepository.FindByIds(
        createLabelDto.categoryIds,
        false,
        transactionalEntityManager,
      );

      if (labelCategory.length !== createLabelDto.categoryIds.length) {
        throw LabelException.LABEL_CATEGORY_NOT_FOUND;
      }

      const label: LabelEntity = Object.assign(
        new LabelEntity(),
        createLabelDto,
      );
      label.createdById = accountInfo?.sub as string;
      label.categories = labelCategory;

      return this.labelRepository.Create(label, transactionalEntityManager);
    });
  }

  async FindById(
    id: string,
    includeDeleted = false,
    accountInfo?: AccountInfo,
  ): Promise<LabelEntity> {
    const includeDeletedSafe = this.getIncludeDeleted(
      accountInfo,
      includeDeleted,
    );
    const label = await this.labelRepository.FindById(id, includeDeletedSafe);
    if (!label) {
      throw LabelException.LABEL_NOT_FOUND;
    }
    return label;
  }

  async FindAll(
    query: FilterLabelQueryDto,
    includeDeleted = false,
    accountInfo?: AccountInfo,
  ): Promise<LabelEntity[]> {
    const includeDeletedSafe = this.getIncludeDeleted(
      accountInfo,
      includeDeleted,
    );
    return this.labelRepository.FindAll(query, includeDeletedSafe);
  }

  async FindPaginated(
    query: FilterLabelQueryDto,
    includeDeleted = false,
    accountInfo?: AccountInfo,
  ): Promise<PaginationResultDto<LabelEntity>> {
    const includeDeletedSafe = this.getIncludeDeleted(
      accountInfo,
      includeDeleted,
    );
    return this.labelRepository.FindPaginated(query, includeDeletedSafe);
  }

  async Update(
    id: string,
    updateLabelDto: UpdateLabelDto,
    accountInfo?: AccountInfo, // account info for validation, if needed
  ): Promise<LabelEntity> {
    const em = await this.labelRepository.GetEntityManager();
    return em.transaction(async (transactionalEntityManager) => {
      const label = await this.labelRepository.FindById(
        id,
        false,
        transactionalEntityManager,
      );
      if (!label) {
        throw LabelException.LABEL_NOT_FOUND;
      }

      if (updateLabelDto.name && updateLabelDto.name !== label.name) {
        const existingLabel = await this.labelRepository.FindByName(
          updateLabelDto?.name,
          false,
          id,
          transactionalEntityManager,
        );

        if (existingLabel) {
          throw LabelException.LABEL_NAME_ALREADY_EXISTED;
        }

        label.name = updateLabelDto.name;
      }

      const categoryArray = label.categories?.map((cat) => cat.id);

      if (
        updateLabelDto.categoryIds &&
        updateLabelDto.categoryIds.length > 0 &&
        updateLabelDto.categoryIds !== categoryArray
      ) {
        const labelCategories = await this.labelCategoryRepository.FindByIds(
          updateLabelDto.categoryIds,
          false,
          transactionalEntityManager,
        );

        if (labelCategories.length !== updateLabelDto.categoryIds.length) {
          throw LabelException.LABEL_CATEGORY_NOT_FOUND;
        }
        label.categories = labelCategories;
      }

      if (
        updateLabelDto.description !== undefined &&
        updateLabelDto.description !== label.description
      ) {
        label.description = updateLabelDto.description;
      }

      if (
        updateLabelDto.color !== undefined &&
        updateLabelDto.color !== label.color
      ) {
        label.color = updateLabelDto.color;
      }
      return this.labelRepository.Update(label, transactionalEntityManager);
    });
  }

  async SoftDelete(
    id: string,
    accountInfo?: AccountInfo, // account info for validation, if needed
  ): Promise<boolean> {
    const em = await this.labelRepository.GetEntityManager();
    return em.transaction(async (transactionalEntityManager) => {
      const label = await this.labelRepository.FindById(
        id,
        false,
        transactionalEntityManager,
      );
      if (!label) {
        throw LabelException.LABEL_NOT_FOUND;
      }

      if (label.presets.length > 0) {
        throw LabelException.LABEL_HAS_PRESETS;
      }

      return await this.labelRepository.SoftDelete(
        id,
        transactionalEntityManager,
      );
    });
  }

  async Restore(
    id: string,
    accountInfo?: AccountInfo, // account info for validation, if needed
  ): Promise<boolean> {
    const em = await this.labelRepository.GetEntityManager();
    return em.transaction(async (transactionalEntityManager) => {
      const label = await this.labelRepository.FindById(
        id,
        true,
        transactionalEntityManager,
      );
      if (!label) {
        throw LabelException.LABEL_NOT_FOUND;
      }

      if (label.categories.find((cat) => cat.deletedAt !== null)) {
        throw LabelException.LABEL_CATEGORY_IS_DELETED;
      }

      return await this.labelRepository.Restore(id, transactionalEntityManager);
    });
  }

  async HardDelete(
    id: string,
    accountInfo?: AccountInfo, // account info for validation, if needed
  ): Promise<boolean> {
    const em = await this.labelRepository.GetEntityManager();
    return em.transaction(async (transactionalEntityManager) => {
      const label = await this.labelRepository.FindById(
        id,
        true,
        transactionalEntityManager,
      );
      if (!label) {
        throw LabelException.LABEL_NOT_FOUND;
      }

      if (label.presets.length > 0) {
        throw LabelException.LABEL_HAS_PRESETS_INCLUDED_SOFT_DELETED;
      }

      return await this.labelRepository.HardDelete(
        id,
        transactionalEntityManager,
      );
    });
  }
}
