import { Injectable } from '@nestjs/common';
import { LabelCategoryRepository } from './label-category.repository';
import { CreateLabelCategoryDto } from './dtos/create-label-category.dto';
import { LabelCategoryEntity } from './label-category.entity';
import { AccountInfo } from 'src/interfaces/request';
import { Role } from '../account/enums/role.enum';
import { LabelCategoryException } from './exceptions/label-categories-exceptions.exceptions';
import { FilterLabelCategoryDto } from './dtos/filter-label-category.dto';
import { PaginationResultDto } from 'src/common/pagination/pagination-result.dto';

@Injectable()
export class LabelCategoryService {
  constructor(
    private readonly labelCategoryRepository: LabelCategoryRepository,
  ) {}

  private getIncludeDeleted(
    accountInfo?: AccountInfo,
    includeDeleted?: boolean,
  ) {
    let safeIncludedDeleted: boolean = false;
    if (
      accountInfo &&
      accountInfo.role === Role.ADMIN &&
      includeDeleted !== false
    ) {
      safeIncludedDeleted = true;
    }
    return safeIncludedDeleted;
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
        throw LabelCategoryException.LabelCategoryNameAlreadyExists;
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
  ): Promise<LabelCategoryEntity | null> {
    const safeIncludedDeleted = this.getIncludeDeleted(
      accountInfo,
      includeDeleted,
    );
    return this.labelCategoryRepository.FindById(id, safeIncludedDeleted);
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
        throw LabelCategoryException.LabelCategoryNotFound;
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
        throw LabelCategoryException.LabelCategoryNameAlreadyExists;
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
        throw LabelCategoryException.LabelCategoryNotFound;
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
        throw LabelCategoryException.LabelCategoryNotFound;
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
        throw LabelCategoryException.LabelCategoryNotFound;
      }

      return this.labelCategoryRepository.HardDelete(
        id,
        transactionalEntityManager,
      );
    });
  }
}
