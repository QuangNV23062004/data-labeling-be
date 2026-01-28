import { Injectable } from '@nestjs/common';
import { LabelCategoryRepository } from './label-category.repository';
import { CreateLabelCategoryDto } from './dtos/create-label-category.dto';
import { LabelCategoryEntity } from './label-category.entity';
import { AccountInfo } from 'src/interfaces/request';
import {
  LabelCategoryNotFoundException,
  LabelCategoryNameAlreadyExistsException,
  LabelCategoryStillHasLabelsException,
  LabelCategoryStillHasIncludeDeletedLabelException,
} from './exceptions/label-categories-exceptions.exceptions';
import { FilterLabelCategoryDto } from './dtos/filter-label-category.dto';
import { PaginationResultDto } from 'src/common/pagination/pagination-result.dto';
import { BaseService } from 'src/common/service/base.service';

@Injectable()
export class LabelCategoryService extends BaseService {
  constructor(
    private readonly labelCategoryRepository: LabelCategoryRepository,
  ) {
    super();
  }

  async Create(
    createLabelCategoryDto: CreateLabelCategoryDto,
    accountInfo?: AccountInfo,
  ): Promise<LabelCategoryEntity> {
    const em = await this.labelCategoryRepository.GetEntityManager();

    return await em.transaction(async (transactionalEntityManager) => {
      const existingLabelCategory =
        await this.labelCategoryRepository.FindByName(
          createLabelCategoryDto.name,
          false,
          '',
          transactionalEntityManager,
        );
      if (existingLabelCategory) {
        throw new LabelCategoryNameAlreadyExistsException();
      }

      const newLabelCategory: LabelCategoryEntity = Object.assign(
        new LabelCategoryEntity(),
        createLabelCategoryDto,
      );
      newLabelCategory.createdById = accountInfo?.sub as string;
      const labelCategory = this.labelCategoryRepository.Create(
        newLabelCategory,
        transactionalEntityManager,
      );
      return labelCategory;
    });
  }

  async FindById(
    id: string,
    includeDeleted = false,
    accountInfo?: AccountInfo,
  ): Promise<LabelCategoryEntity> {
    const safeIncludedDeleted = this.getIncludeDeleted(
      accountInfo,
      includeDeleted,
    );
    const labelCategory = await this.labelCategoryRepository.FindById(
      id,
      safeIncludedDeleted,
    );
    if (!labelCategory) {
      throw new LabelCategoryNotFoundException();
    }
    return labelCategory;
  }

  async FindAll(
    query: FilterLabelCategoryDto,
    includeDeleted = false,
    accountInfo?: AccountInfo,
  ): Promise<LabelCategoryEntity[]> {
    const safeIncludedDeleted = this.getIncludeDeleted(
      accountInfo,
      includeDeleted,
    );
    return this.labelCategoryRepository.FindAll(query, safeIncludedDeleted);
  }

  async FindPaginated(
    query: FilterLabelCategoryDto,
    includeDeleted = false,
    accountInfo?: AccountInfo,
  ): Promise<PaginationResultDto<LabelCategoryEntity>> {
    const safeIncludedDeleted = this.getIncludeDeleted(
      accountInfo,
      includeDeleted,
    );
    return this.labelCategoryRepository.FindPaginated(
      query,
      safeIncludedDeleted,
    );
  }

  async Update(
    id: string,
    updateLabelCategoryDto: Partial<LabelCategoryEntity>,
    accountInfo?: AccountInfo, //for validate later if needed
  ): Promise<LabelCategoryEntity> {
    const em = await this.labelCategoryRepository.GetEntityManager();
    return await em.transaction(async (transactionalEntityManager) => {
      const labelCategory = await this.labelCategoryRepository.FindById(
        id,
        false,
        transactionalEntityManager,
      );

      if (!labelCategory) {
        throw new LabelCategoryNotFoundException();
      }

      if (
        updateLabelCategoryDto.name &&
        updateLabelCategoryDto.name !== labelCategory.name
      ) {
        labelCategory.name = updateLabelCategoryDto.name;
      }

      const existingLabelCategory =
        await this.labelCategoryRepository.FindByName(
          updateLabelCategoryDto.name as string,
          false,
          id,
          transactionalEntityManager,
        );
      if (existingLabelCategory) {
        throw new LabelCategoryNameAlreadyExistsException();
      }

      if (
        updateLabelCategoryDto.description &&
        updateLabelCategoryDto.description !== labelCategory.description
      ) {
        labelCategory.description = updateLabelCategoryDto.description;
      }
      return this.labelCategoryRepository.Update(
        labelCategory,
        transactionalEntityManager,
      );
    });
  }

  async SoftDelete(
    id: string,
    accountInfo?: AccountInfo, //for validate later if needed
  ): Promise<boolean> {
    const em = await this.labelCategoryRepository.GetEntityManager();
    return await em.transaction(async (transactionalEntityManager) => {
      const labelCategory = await this.labelCategoryRepository.FindById(
        id,
        false,
        transactionalEntityManager,
      );
      if (!labelCategory) {
        throw new LabelCategoryNotFoundException();
      }

      if (labelCategory.labels.length > 0) {
        throw new LabelCategoryStillHasLabelsException();
      }

      return this.labelCategoryRepository.SoftDelete(
        id,
        transactionalEntityManager,
      );
    });
  }

  async Restore(
    id: string,
    accountInfo?: AccountInfo, //for validate later if needed
  ): Promise<boolean> {
    const em = await this.labelCategoryRepository.GetEntityManager();
    return await em.transaction(async (transactionalEntityManager) => {
      const labelCategory = await this.labelCategoryRepository.FindById(
        id,
        true,
        transactionalEntityManager,
      );
      if (!labelCategory) {
        throw new LabelCategoryNotFoundException();
      }

      return this.labelCategoryRepository.Restore(
        id,
        transactionalEntityManager,
      );
    });
  }

  async HardDelete(
    id: string,
    accountInfo?: AccountInfo, //for validate later if needed
  ): Promise<boolean> {
    const em = await this.labelCategoryRepository.GetEntityManager();
    return await em.transaction(async (transactionalEntityManager) => {
      const labelCategory = await this.labelCategoryRepository.FindById(
        id,
        true,
        transactionalEntityManager,
      );
      if (!labelCategory) {
        throw new LabelCategoryNotFoundException();
      }

      if (labelCategory.labels.length > 0) {
        if (labelCategory.labels.every((label) => label.deletedAt !== null)) {
          throw new LabelCategoryStillHasIncludeDeletedLabelException();
        }
        throw new LabelCategoryStillHasLabelsException();
      }

      return this.labelCategoryRepository.HardDelete(
        id,
        transactionalEntityManager,
      );
    });
  }
}
