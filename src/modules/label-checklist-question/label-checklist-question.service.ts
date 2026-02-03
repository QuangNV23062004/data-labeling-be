import { Injectable } from '@nestjs/common';
import { LabelChecklistQuestionRepository } from './label-checklist-question.repository';
import { BaseService } from 'src/common/service/base.service';
import { AccountInfo } from 'src/interfaces/request';
import { FilterLabelChecklistQuestionQueryDto } from './dtos/filter-label-checklist-question-query.dto';
import { LabelChecklistQuestionEntity } from './label-checklist-question.entity';
import { PaginationResultDto } from 'src/common/pagination/pagination-result.dto';
import {
  CannotCreateAnnotatorChecklistQuestionWithParentException,
  CannotCreateReviewerChecklistQuestionWithInvalidParentException,
  CannotCreateReviewerChecklistQuestionWithoutParentException,
  CannotDeleteQuestionWithAnswersException,
  CannotDeleteQuestionWithChildrenException,
  CannotUpdateAnnotatorChecklistQuestionWithParentException,
  CannotUpdateChecklistWithChildrenToReviewerChecklistException,
  CannotUpdateQuestionRoleException,
  CannotUpdateReviewerChecklistQuestionWithInvalidParentException,
  CannotUpdateReviewerChecklistQuestionWithoutParentException,
  ChildrenLabelIdMustMatchParentLabelIdException,
  LabelChecklistQuestionNotFoundException,
  LabelReferencedNotFoundToRestoreException,
  ParentQuestionNotFoundToRestoreException,
} from './exceptions/label-checklist-question-exceptions.exception';
import { CreateLabelChecklistQuestionDto } from './dtos/create-label-checklist-question.dto';
import { LabelNotFoundException } from '../label/exceptions/label-exceptions.exceptions';
import { UpdateLabelChecklistQuestionDto } from './dtos/update-label-checklist-question.dto';
import { LabelRepository } from '../label/label.repository';
import { Role } from '../account/enums/role.enum';

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

      if (data.parentId && data.roleEnum === Role.ANNOTATOR) {
        throw new CannotCreateAnnotatorChecklistQuestionWithParentException();
      }

      if (!data.parentId && data.roleEnum === Role.REVIEWER) {
        throw new CannotCreateReviewerChecklistQuestionWithoutParentException();
      }

      if (data.parentId) {
        const parentQuestion =
          await this.labelChecklistQuestionRepository.FindById(
            data.parentId,
            false,
            transactionalEntityManager,
          );

        if (!parentQuestion) {
          throw new LabelChecklistQuestionNotFoundException(data.parentId);
        }

        if (data.labelId && parentQuestion.labelId !== data.labelId) {
          throw new ChildrenLabelIdMustMatchParentLabelIdException();
        }

        // reviewer checklist: linked to annotator checklist questions
        if (
          data.roleEnum === Role.REVIEWER &&
          parentQuestion.roleEnum !== Role.ANNOTATOR
        ) {
          throw new CannotCreateReviewerChecklistQuestionWithInvalidParentException();
        }

        entity.labelChecklistQuestionId = parentQuestion.id;

        // Inherit label from parent if not provided
        if (!data.labelId) {
          entity.labelId = parentQuestion.labelId;
        }
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

      // Block role updates entirely
      if (data?.roleEnum !== undefined) {
        throw new CannotUpdateQuestionRoleException();
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

      if (data.parentId !== undefined) {
        entity.labelChecklistQuestionId = data.parentId;
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

      // Re-check label vs parent for reviewers (even if parentId wasn't updated)
      if (
        entity.roleEnum === Role.REVIEWER &&
        entity.labelChecklistQuestionId
      ) {
        const parentQuestion =
          await this.labelChecklistQuestionRepository.FindById(
            entity.labelChecklistQuestionId,
            false,
            transactionalEntityManager,
          );

        if (!parentQuestion) {
          throw new LabelChecklistQuestionNotFoundException(
            entity.labelChecklistQuestionId,
          );
        }

        if (entity.labelId && parentQuestion.labelId !== entity.labelId) {
          throw new ChildrenLabelIdMustMatchParentLabelIdException();
        }
      }

      // Validate parent constraints based on existing role
      if (data.parentId !== undefined) {
        if (entity.roleEnum === Role.ANNOTATOR && data.parentId) {
          throw new CannotUpdateAnnotatorChecklistQuestionWithParentException();
        }

        if (entity.roleEnum === Role.REVIEWER && !data.parentId) {
          throw new CannotUpdateReviewerChecklistQuestionWithoutParentException();
        }

        if (data.parentId) {
          const parentQuestion =
            await this.labelChecklistQuestionRepository.FindById(
              data.parentId,
              false,
              transactionalEntityManager,
            );

          if (!parentQuestion) {
            throw new LabelChecklistQuestionNotFoundException(data.parentId);
          }

          if (
            entity.roleEnum === Role.REVIEWER &&
            parentQuestion.roleEnum !== Role.ANNOTATOR
          ) {
            throw new CannotUpdateReviewerChecklistQuestionWithInvalidParentException();
          }

          if (entity.labelId && parentQuestion.labelId !== entity.labelId) {
            throw new ChildrenLabelIdMustMatchParentLabelIdException();
          }

          entity.labelChecklistQuestionId = parentQuestion.id;
        }
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

      if (existingQuestion.children.length > 0) {
        throw new CannotDeleteQuestionWithChildrenException(id);
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

      if (
        existingQuestion?.parent &&
        existingQuestion?.parent?.deletedAt !== null
      ) {
        throw new ParentQuestionNotFoundToRestoreException(
          existingQuestion.labelChecklistQuestionId,
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

      if ((existingQuestion?.children || []).length > 0) {
        throw new CannotDeleteQuestionWithChildrenException(id, true);
      }

      return this.labelChecklistQuestionRepository.HardDelete(
        id,
        transactionalEntityManager,
      );
    });
  }
}
