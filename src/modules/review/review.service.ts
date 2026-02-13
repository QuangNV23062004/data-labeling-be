import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/service/base.service';
import { ReviewRepository } from './review.repository';
import { AccountInfo } from 'src/interfaces/request';
import { FilterReviewQueryDto } from './dtos/filter-review-query.dto';
import { CreateReviewDto } from './dtos/create-review.dto';
import { ReviewEntity } from './review.entity';
import { Role } from '../account/enums/role.enum';
import {
  CannotCreateReviewLinkedToAnnotatorChecklistAnswerException,
  CannotDeleteApprovedReviewException,
  CannotDeleteOtherReviewerException,
  CannotHardDeleteReviewWithErrorsException,
  CannotRestoreReviewWithDeletedChecklistAnswerException,
  CannotUpdateApprovedReviewException,
  CannotUpdateOtherReviewerException,
  ReviewDecisionConflictException,
  ReviewForThisChecklistAnswerAlreadyExistsException,
  ReviewNotFoundException,
  InvalidReviewException,
} from './exceptions/review-exceptions.exception';
import { UpdateReviewDto } from './dtos/update-review.dto';
import { Decision } from './enums/decisions.enums';
import { ChecklistAnswerRepository } from '../checklist-answer/checklist-answer.repository';
import { ChecklistAnswerNotFoundException } from '../checklist-answer/exceptions/checklist-answer-exceptions.exception';
import { AnswerTypeEnum } from '../checklist-answer/enums/answer-type.enums';
import { AccountRepository } from '../account/account.repository';

@Injectable()
export class ReviewService extends BaseService {
  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly checklistAnswerRepository: ChecklistAnswerRepository,
    private readonly accountRepository: AccountRepository,
  ) {
    super();
  }

  async FindById(
    id: string,
    includeDeleted: boolean = false,
    accountInfo?: AccountInfo,
  ) {
    const safeIncludeDeleted = this.getIncludeDeleted(
      accountInfo,
      includeDeleted,
    );

    return this.reviewRepository.FindById(id, safeIncludeDeleted);
  }

  async FindByIds(
    ids: string[],
    includeDeleted: boolean = false,
    accountInfo?: AccountInfo,
  ) {
    const safeIncludeDeleted = this.getIncludeDeleted(
      accountInfo,
      includeDeleted,
    );

    return this.reviewRepository.FindByIds(ids, safeIncludeDeleted);
  }

  async FindAll(
    query: FilterReviewQueryDto,
    includeDeleted: boolean = false,
    accountInfo?: AccountInfo,
  ) {
    const safeIncludeDeleted = this.getIncludeDeleted(
      accountInfo,
      includeDeleted,
    );
    return this.reviewRepository.FindAll(query, safeIncludeDeleted);
  }

  async FindPaginated(
    query: FilterReviewQueryDto,
    includeDeleted: boolean = false,
    accountInfo?: AccountInfo,
  ) {
    const safeIncludeDeleted = this.getIncludeDeleted(
      accountInfo,
      includeDeleted,
    );

    return this.reviewRepository.FindPaginated(query, safeIncludeDeleted);
  }

  async Create(dto: CreateReviewDto, accountInfo?: AccountInfo) {
    const em = await this.reviewRepository.GetEntityManager();
    return await em?.transaction(async (transactionalEntityManager) => {
      const entity: ReviewEntity = new ReviewEntity();

      Object.assign(entity, dto);

      if (dto.checklistAnswerId) {
        const existingReview =
          await this.reviewRepository.FindByChecklistAnswerId(
            dto.checklistAnswerId,
            false,
            transactionalEntityManager,
          );

        if (existingReview) {
          throw new ReviewForThisChecklistAnswerAlreadyExistsException(
            dto.checklistAnswerId,
          );
        }

        const checklistAnswer = await this.checklistAnswerRepository.FindById(
          dto.checklistAnswerId,
          false,
          transactionalEntityManager,
        );
        if (!checklistAnswer) {
          throw new ChecklistAnswerNotFoundException(dto.checklistAnswerId);
        }

        if (checklistAnswer.roleType !== Role.REVIEWER) {
          //custome exception, only reviewer checklist answer can create reviewed
          throw new CannotCreateReviewLinkedToAnnotatorChecklistAnswerException();
        }
        entity.checklistAnswerId = checklistAnswer.id;
        entity.checklistAnswer = checklistAnswer;
        entity.fileLabelId = checklistAnswer.fileLabelId;
      }

      if (
        (dto.decision === Decision.APPROVED &&
          entity?.checklistAnswer?.answerType !== AnswerTypeEnum.APPROVED) ||
        (dto.decision === Decision.REJECTED &&
          entity?.checklistAnswer?.answerType !== AnswerTypeEnum.REJECTED)
      ) {
        throw new ReviewDecisionConflictException(
          dto.decision,
          entity?.checklistAnswer?.answerType,
        );
      }

      if (accountInfo?.role === Role.REVIEWER) {
        entity.reviewerId = accountInfo?.sub as string;
      }
      if (accountInfo?.role === Role.ADMIN) {
        if (!dto.reviewerId) {
          throw new InvalidReviewException(
            'Field "reviewerId" is required when creating a review as an admin',
          );
        }
        const reviewer = await this.accountRepository.FindById(
          dto.reviewerId,
          false,
          transactionalEntityManager,
        );

        if (!reviewer) {
          throw new InvalidReviewException(
            `Reviewer with ID "${dto.reviewerId}" not found`,
          );
        }

        if (reviewer.role !== Role.REVIEWER) {
          throw new InvalidReviewException(
            `Account with ID "${dto.reviewerId}" is not a reviewer`,
          );
        }
        entity.reviewerId = dto.reviewerId;
      }

      entity.reviewedAt = new Date();
      return this.reviewRepository.Create(entity, transactionalEntityManager);
    });
  }

  async Update(id: string, dto: UpdateReviewDto, accountInfo?: AccountInfo) {
    const em = await this.reviewRepository.GetEntityManager();
    return await em?.transaction(async (transactionalEntityManager) => {
      const entity = await this.reviewRepository.FindById(
        id,
        false,
        transactionalEntityManager,
      );

      if (!entity) {
        throw new ReviewNotFoundException(id);
      }

      if (
        accountInfo?.sub !== entity.reviewerId &&
        accountInfo?.role !== Role.ADMIN
      ) {
        throw new CannotUpdateOtherReviewerException();
      }

      if (entity.decision === Decision.APPROVED) {
        throw new CannotUpdateApprovedReviewException();
      }
      if (
        dto.checklistAnswerId &&
        dto.checklistAnswerId !== entity.checklistAnswerId
      ) {
        const existingReview =
          await this.reviewRepository.FindByChecklistAnswerId(
            dto.checklistAnswerId,
            false,
            transactionalEntityManager,
          );

        if (existingReview && existingReview.id !== entity.id) {
          throw new ReviewForThisChecklistAnswerAlreadyExistsException(
            dto.checklistAnswerId,
          );
        }

        const checklistAnswer = await this.checklistAnswerRepository.FindById(
          dto.checklistAnswerId,
          false,
          transactionalEntityManager,
        );

        if (!checklistAnswer) {
          throw new ChecklistAnswerNotFoundException(dto.checklistAnswerId);
        }

        if (checklistAnswer.roleType !== Role.REVIEWER) {
          //custome exception, only reviewer checklist answer can create reviewed
          throw new CannotCreateReviewLinkedToAnnotatorChecklistAnswerException();
        }
        entity.checklistAnswerId = checklistAnswer.id;
        entity.checklistAnswer = checklistAnswer;
        entity.fileLabelId = checklistAnswer.fileLabelId;
      }

      if (dto.decision && dto.decision !== entity.decision) {
        if (
          (dto.decision === Decision.APPROVED &&
            entity?.checklistAnswer?.answerType !== AnswerTypeEnum.APPROVED) ||
          (dto.decision === Decision.REJECTED &&
            entity?.checklistAnswer?.answerType !== AnswerTypeEnum.REJECTED)
        ) {
          throw new ReviewDecisionConflictException(
            dto.decision,
            entity?.checklistAnswer?.answerType,
          );
        }
      }

      Object.assign(entity, dto);

      if (dto.decision) {
        entity.reviewedAt = new Date();
      }

      return this.reviewRepository.Update(entity, transactionalEntityManager);
    });
  }

  async SoftDelete(id: string, accountInfo?: AccountInfo) {
    const em = await this.reviewRepository.GetEntityManager();
    return await em?.transaction(async (transactionalEntityManager) => {
      const entity = await this.reviewRepository.FindById(
        id,
        false,
        transactionalEntityManager,
      );
      if (!entity) {
        throw new ReviewNotFoundException(id);
      }

      if (
        entity.reviewerId !== accountInfo?.sub &&
        accountInfo?.role !== Role.ADMIN
      ) {
        throw new CannotDeleteOtherReviewerException();
      }

      if (entity.decision === Decision.APPROVED) {
        throw new CannotDeleteApprovedReviewException();
      }

      return this.reviewRepository.SoftDelete(id, transactionalEntityManager);
    });
  }

  async Restore(id: string, accountInfo?: AccountInfo) {
    const em = await this.reviewRepository.GetEntityManager();
    return await em?.transaction(async (transactionalEntityManager) => {
      const entity = await this.reviewRepository.FindById(
        id,
        true,
        transactionalEntityManager,
      );
      if (!entity) {
        throw new ReviewNotFoundException(id);
      }

      if (entity.checklistAnswer && entity.checklistAnswer.deletedAt !== null) {
        throw new CannotRestoreReviewWithDeletedChecklistAnswerException(
          entity.checklistAnswer.id,
        );
      }
      return this.reviewRepository.Restore(id, transactionalEntityManager);
    });
  }

  async HardDelete(id: string, accountInfo?: AccountInfo) {
    const em = await this.reviewRepository.GetEntityManager();
    return await em?.transaction(async (transactionalEntityManager) => {
      this.validateAdminForHardDelete(accountInfo);

      const entity = await this.reviewRepository.FindById(
        id,
        true,
        transactionalEntityManager,
      );
      if (!entity) {
        throw new ReviewNotFoundException(id);
      }

      if (entity.decision === Decision.APPROVED) {
        throw new CannotDeleteApprovedReviewException();
      }

      if (entity?.reviewErrors?.length > 0) {
        throw new CannotHardDeleteReviewWithErrorsException(id);
      }
      return this.reviewRepository.HardDelete(id, transactionalEntityManager);
    });
  }
}
