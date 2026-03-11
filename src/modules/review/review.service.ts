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
import { SubmitReviewsDto } from './dtos/submit-reviews.dto';
import { ChecklistAnswerDomain } from '../checklist-answer/checklist-answer.domain';
import { FileLabelRepository } from '../file-label/file-label.repository';
import { FileLabelDomain } from '../file-label/file-label.domain';
import { FileLabelEntity } from '../file-label/file-label.entity';
import { ChecklistAnswerEntity } from '../checklist-answer/checklist-answer.entity';
import { LabelChecklistQuestionRepository } from '../label-checklist-question/label-checklist-question.repository';
import { ReviewErrorEntity } from '../review-error/review-error.entity';
import { ReviewErrorRepository } from '../review-error/review-error.repository';
import { FileLabelStatusEnums } from '../file-label/enums/file-label.enums';
import { ReviewErrorTypeRepository } from '../review-error-type/review-error-type.repository';
import { ReviewerAggregationStats } from './review.repository';
import { EntityManager } from 'typeorm';
import { FileEntity } from '../file/file.entity';
import { FileStatus } from '../file/enums/file-status.enums';

@Injectable()
export class ReviewService extends BaseService {
  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly checklistAnswerRepository: ChecklistAnswerRepository,
    private readonly accountRepository: AccountRepository,
    private readonly checklistAnswerDomain: ChecklistAnswerDomain,
    private readonly fileLabelRepository: FileLabelRepository,
    private readonly fileLabelDomain: FileLabelDomain,
    private readonly labelChecklistQuestionRepository: LabelChecklistQuestionRepository,
    private readonly reviewErrorRepository: ReviewErrorRepository,
    private readonly reviewErrorTypeRepository: ReviewErrorTypeRepository,
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

  async GetReviewerAggregationStats(
    reviewerId: string,
  ): Promise<ReviewerAggregationStats> {
    return this.reviewRepository.GetReviewerAggregationStats(reviewerId);
  }

  async Create(dto: CreateReviewDto, accountInfo?: AccountInfo) {
    const em = await this.reviewRepository.GetEntityManager();
    return await em.transaction(async (transactionalEntityManager) => {
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
    return await em.transaction(async (transactionalEntityManager) => {
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
    return await em.transaction(async (transactionalEntityManager) => {
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
    return await em.transaction(async (transactionalEntityManager) => {
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
    return await em.transaction(async (transactionalEntityManager) => {
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

  async SubmitReview(dto: SubmitReviewsDto, accountInfo?: AccountInfo) {
    // console.log(JSON.stringify(dto, null, 2));
    const em = await this.reviewRepository.GetEntityManager();
    return await em.transaction(async (transactionalEntityManager) => {
      const fileLabel = await this.fileLabelRepository.FindById(
        dto.fileLabelId,
        false,
        transactionalEntityManager,
      );

      this.fileLabelDomain.validateFileLabelNotFound(
        fileLabel,
        dto.fileLabelId,
      );

      this.fileLabelDomain.validateFileLabelLifeCycleNotCompleted(fileLabel!);

      this.fileLabelDomain.validateFileAccess(fileLabel!.file, accountInfo);

      const { round, role, type } =
        await this.checklistAnswerRepository.GetLatestAttemptedLabelCounts(
          dto.fileLabelId,
          transactionalEntityManager,
        );

      let answerType: AnswerTypeEnum;
      if (dto.decision === Decision.APPROVED) {
        answerType = AnswerTypeEnum.APPROVED;
      } else if (dto.decision === Decision.REJECTED) {
        answerType = AnswerTypeEnum.REJECTED;
      } else {
        throw new InvalidReviewException(
          'Submit review only supports approved or rejected decisions',
        );
      }

      this.checklistAnswerDomain.validateAnswerTypeRole(
        answerType,
        accountInfo,
      );

      this.checklistAnswerDomain.validateChecklistAnswerLifeCycle(
        fileLabel!,
        answerType,
        round,
        role,
        type,
        accountInfo,
      );

      let checklistAnswerEntity = new ChecklistAnswerEntity();
      checklistAnswerEntity.fileLabelId = dto.fileLabelId;
      checklistAnswerEntity.fileLabel = fileLabel!;
      checklistAnswerEntity.answerType = answerType;
      checklistAnswerEntity.answerData = dto.answerData;
      checklistAnswerEntity.answerById = accountInfo?.sub as string;
      checklistAnswerEntity.roleType = accountInfo?.role as Role;

      // console.log(JSON.stringify(checklistAnswerEntity, null, 2));
      //get all questions for this label target this role
      const questions = await this.labelChecklistQuestionRepository.FindAll(
        {
          labelId: fileLabel!.labelId ?? undefined,
          role: accountInfo?.role as Role,
        },
        false,
        transactionalEntityManager,
      );

      this.checklistAnswerDomain.validateAnswerData(
        questions,
        checklistAnswerEntity,
        fileLabel!,
        dto.answerData,
        accountInfo,
      );

      this.checklistAnswerDomain.setAttemptNumber(
        round,
        role,
        checklistAnswerEntity,
      );

      checklistAnswerEntity = await this.checklistAnswerRepository.Create(
        checklistAnswerEntity,
        transactionalEntityManager,
      );

      let reviewEntity = new ReviewEntity();
      reviewEntity.fileLabelId = dto.fileLabelId;
      reviewEntity.reviewerId = accountInfo?.sub as string;
      reviewEntity.decision = dto.decision;
      reviewEntity.feedbacks = dto.feedbacks || '';
      reviewEntity.reviewedAt = new Date();
      reviewEntity.checklistAnswerId = checklistAnswerEntity.id;
      reviewEntity = await this.reviewRepository.Create(
        reviewEntity,
        transactionalEntityManager,
      );

      const reviewErrorsInput = Array.isArray(dto.reviewErrors)
        ? dto.reviewErrors
        : [];

      if (
        reviewEntity.decision === Decision.REJECTED &&
        reviewErrorsInput.length === 0
      ) {
        throw new InvalidReviewException(
          'Rejected review must include at least 1 review error',
        );
      }

      if (
        reviewEntity.decision === Decision.APPROVED &&
        reviewErrorsInput.length > 0
      ) {
        throw new InvalidReviewException(
          'Cannot create review errors for an approved review',
        );
      }

      const reviewErrorTypeIds = reviewErrorsInput.map(
        (error) => error.reviewErrorTypeId,
      );

      const uniqueReviewErrorTypeIds = Array.from(new Set(reviewErrorTypeIds));
      const reviewErrorTypes = await this.reviewErrorTypeRepository.FindByIds(
        uniqueReviewErrorTypeIds,
        false,
        transactionalEntityManager,
      );

      if (reviewErrorTypes.length !== uniqueReviewErrorTypeIds.length) {
        const notFoundIds = uniqueReviewErrorTypeIds.filter(
          (id) => !reviewErrorTypes.some((type) => type.id === id),
        );
        throw new InvalidReviewException(
          `Review error types with IDs ${notFoundIds.join(', ')} not found`,
        );
      }

      let reviewErrors = reviewErrorsInput.map((errorDto) => {
        const reviewError = new ReviewErrorEntity();
        reviewError.reviewId = reviewEntity.id;
        reviewError.reviewErrorTypeId = errorDto.reviewErrorTypeId;
        reviewError.description = errorDto.description || '';
        reviewError.errorLocation = errorDto.errorLocation || null;
        return reviewError;
      });
      reviewErrors = await this.reviewErrorRepository.CreateBulk(
        reviewErrors,
        transactionalEntityManager,
      );
      const newStatus =
        dto.decision === Decision.APPROVED
          ? FileLabelStatusEnums.APPROVED
          : FileLabelStatusEnums.REJECTED;

      fileLabel!.status = newStatus;
      const result = await this.fileLabelRepository.UpdateStatus(
        fileLabel!.id,
        newStatus,
        transactionalEntityManager,
      );
      if (!result) {
        throw new InvalidReviewException(
          `Failed to update file label status to ${newStatus}`,
        );
      }

      await this.recomputeFileStatusAfterReviewerSubmit(
        fileLabel!.fileId,
        transactionalEntityManager,
      );

      reviewEntity.checklistAnswer = checklistAnswerEntity;
      reviewEntity.reviewErrors = reviewErrors;
      return reviewEntity;
    });
  }

  private async recomputeFileStatusAfterReviewerSubmit(
    fileId: string,
    em: EntityManager,
  ): Promise<void> {
    const fileLabelRepository = em.getRepository(FileLabelEntity);
    const fileRepository = em.getRepository(FileEntity);

    const labels = await fileLabelRepository
      .createQueryBuilder('fileLabel')
      .where('fileLabel.fileId = :fileId', { fileId })
      .andWhere('fileLabel.deletedAt IS NULL')
      .andWhere('fileLabel.status != :reassigned', {
        reassigned: FileLabelStatusEnums.REASSIGNED,
      })
      .getMany();

    if (labels.length === 0) {
      return;
    }

    const statuses = labels.map((label) => label.status);

    // Rule 1: all approved => file approved
    if (statuses.every((status) => status === FileLabelStatusEnums.APPROVED)) {
      await fileRepository.update(fileId, { status: FileStatus.APPROVED });
      return;
    }

    // Rule 2: any pending/in-progress => keep current file status unchanged
    const hasPending = statuses.some(
      (status) =>
        status === FileLabelStatusEnums.PENDING_REVIEW ||
        status === FileLabelStatusEnums.IN_PROGRESS,
    );
    if (hasPending) {
      return;
    }

    // Rule 3: if all reviewed (approved/rejected) and at least one rejected => requires_fix
    const allReviewed = statuses.every(
      (status) =>
        status === FileLabelStatusEnums.APPROVED ||
        status === FileLabelStatusEnums.REJECTED,
    );

    if (allReviewed && statuses.includes(FileLabelStatusEnums.REJECTED)) {
      await fileRepository.update(fileId, { status: FileStatus.REQUIRES_FIX });
    }
  }
}
