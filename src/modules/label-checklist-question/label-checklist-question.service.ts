import { Injectable } from '@nestjs/common';
import { LabelChecklistQuestionRepository } from './label-checklist-question.repository';
import { BaseService } from 'src/common/service/base.service';
import { AccountInfo } from 'src/interfaces/request';
import { FilterLabelChecklistQuestionQueryDto } from './dtos/filter-label-checklist-question-query.dto';
import { LabelChecklistQuestionEntity } from './label-checklist-question.entity';
import { PaginationResultDto } from 'src/common/pagination/pagination-result.dto';
import {
  CannotUpdateQuestionRoleException,
  LabelChecklistQuestionNotFoundException,
  LabelReferencedNotFoundToRestoreException,
} from './exceptions/label-checklist-question-exceptions.exception';
import { CreateLabelChecklistQuestionDto } from './dtos/create-label-checklist-question.dto';
import { LabelNotFoundException } from '../label/exceptions/label-exceptions.exceptions';
import { UpdateLabelChecklistQuestionDto } from './dtos/update-label-checklist-question.dto';
import { LabelRepository } from '../label/label.repository';

@Injectable()
export class LabelChecklistQuestionService extends BaseService {
  constructor(
    private readonly labelChecklistQuestionRepository: LabelChecklistQuestionRepository,
    private readonly labelRepository: LabelRepository,
  ) {
    super();
  }

  async FindAll(
    query: FilterLabelChecklistQuestionQueryDto,
    includeDeleted: boolean = false,
    accountInfo?: AccountInfo,
  ): Promise<LabelChecklistQuestionEntity[]> {
    const safeIncludedDeleted = this.getIncludeDeleted(
      accountInfo,
      includeDeleted,
    );

    return this.labelChecklistQuestionRepository.FindAll(
      query,
      safeIncludedDeleted,
    );
  }

  async FindPaginated(
    query: FilterLabelChecklistQuestionQueryDto,
    includeDeleted: boolean = false,
    accountInfo?: AccountInfo,
  ): Promise<PaginationResultDto<LabelChecklistQuestionEntity>> {
    const safeIncludedDeleted = this.getIncludeDeleted(
      accountInfo,
      includeDeleted,
    );

    return this.labelChecklistQuestionRepository.FindPaginated(
      query,
      safeIncludedDeleted,
    );
  }

  async FindById(
    id: string,
    includeDeleted: boolean = false,
    accountInfo?: AccountInfo,
  ): Promise<LabelChecklistQuestionEntity> {
    const safeIncludedDeleted = this.getIncludeDeleted(
      accountInfo,
      includeDeleted,
    );

    const result = await this.labelChecklistQuestionRepository.FindById(
      id,
      safeIncludedDeleted,
    );

    if (!result) {
      throw new LabelChecklistQuestionNotFoundException(id);
    }

    return result;
  }

  async FindByIds(
    ids: string[],
    includeDeleted: boolean = false,
    accountInfo?: AccountInfo,
  ) {
    const safeIncludedDeleted = this.getIncludeDeleted(
      accountInfo,
      includeDeleted,
    );
    return this.labelChecklistQuestionRepository.FindByIds(
      ids,
      safeIncludedDeleted,
    );
  }

  async Create(
    data: CreateLabelChecklistQuestionDto,
    accountInfo?: AccountInfo,
  ): Promise<LabelChecklistQuestionEntity> {
    const em = await this.labelChecklistQuestionRepository.GetEntityManager();

    return em.transaction(async (transactionalEntityManager) => {
      const entity: LabelChecklistQuestionEntity = Object.assign(
        new LabelChecklistQuestionEntity(),
        data,
      );
      if (data.labelId) {
        const label = await this.labelRepository.FindById(
          data.labelId,
          false,
          transactionalEntityManager,
        );

        if (!label) {
          throw new LabelNotFoundException();
        }
        entity.labelId = label.id;
      }

      entity.createdById = accountInfo?.sub as string;

      return this.labelChecklistQuestionRepository.Create(
        entity,
        transactionalEntityManager,
      );
    });
  }

  async Update(
    id: string,
    data: UpdateLabelChecklistQuestionDto,
    accountInfo?: AccountInfo,
  ): Promise<LabelChecklistQuestionEntity> {
    const em = await this.labelChecklistQuestionRepository.GetEntityManager();
    return em.transaction(async (transactionalEntityManager) => {
      const entity = await this.labelChecklistQuestionRepository.FindById(
        id,
        false,
        transactionalEntityManager,
      );
      if (!entity) {
        throw new LabelChecklistQuestionNotFoundException(id);
      }

      if (data?.roleEnum && data.roleEnum !== entity.roleEnum) {
        entity.roleEnum = data.roleEnum;
      }

      if (data?.description !== undefined) {
        entity.description = data.description;
      }

      if (data?.labelId !== undefined) {
        entity.labelId = data.labelId;
      }

      if (data?.name !== undefined) {
        entity.name = data.name;
      }

      // Validate label if provided
      if (data.labelId) {
        const label = await this.labelRepository.FindById(
          data.labelId,
          false,
          transactionalEntityManager,
        );

        if (!label) {
          throw new LabelNotFoundException();
        }

        entity.labelId = label.id;
      }

      return this.labelChecklistQuestionRepository.Update(
        entity,
        transactionalEntityManager,
      );
    });
  }

  async SoftDelete(id: string, accountInfo?: AccountInfo): Promise<boolean> {
    const em = await this.labelChecklistQuestionRepository.GetEntityManager();
    return em.transaction(async (transactionalEntityManager) => {
      const existingQuestion =
        await this.labelChecklistQuestionRepository.FindById(
          id,
          false,
          transactionalEntityManager,
        );

      if (!existingQuestion) {
        throw new LabelChecklistQuestionNotFoundException(id);
      }

      return this.labelChecklistQuestionRepository.SoftDelete(
        id,
        transactionalEntityManager,
      );
    });
  }

  async Restore(id: string, accountInfo?: AccountInfo): Promise<boolean> {
    const em = await this.labelChecklistQuestionRepository.GetEntityManager();
    return em.transaction(async (transactionalEntityManager) => {
      const existingQuestion =
        await this.labelChecklistQuestionRepository.FindById(
          id,
          true,
          transactionalEntityManager,
        );

      if (!existingQuestion) {
        throw new LabelChecklistQuestionNotFoundException(id, true);
      }

      if (
        existingQuestion?.label &&
        existingQuestion?.label?.deletedAt !== null
      ) {
        throw new LabelReferencedNotFoundToRestoreException(
          existingQuestion.labelId,
        );
      }

      return this.labelChecklistQuestionRepository.Restore(
        id,
        transactionalEntityManager,
      );
    });
  }

  async HardDelete(id: string, accountInfo?: AccountInfo): Promise<boolean> {
    this.validateAdminForHardDelete(accountInfo);

    const em = await this.labelChecklistQuestionRepository.GetEntityManager();
    return em.transaction(async (transactionalEntityManager) => {
      const existingQuestion =
        await this.labelChecklistQuestionRepository.FindById(
          id,
          true,
          transactionalEntityManager,
        );

      if (!existingQuestion) {
        throw new LabelChecklistQuestionNotFoundException(id, true);
      }

      return this.labelChecklistQuestionRepository.HardDelete(
        id,
        transactionalEntityManager,
      );
    });
  }
}
