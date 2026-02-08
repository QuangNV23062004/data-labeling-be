import { Injectable } from '@nestjs/common';
import { AnswerTypeEnum } from './enums/answer-type.enums';
import { Role } from '../account/enums/role.enum';
import { AccountInfo } from 'src/interfaces/request';
import {
  AnswerTypeNotValidInChecklistLifeCycle,
  ChecklistLifeCycleHasCompleted,
  InsufficientAnswerProvidedForRequiredQuestions,
  InvalidAnswerTypeForRole,
  InvalidChecklistAnswerException,
  InvalidQuestionIdInQuestionDataForThisLabelAndRole,
  NotInTurnToCreateChecklistAnswer,
  ReviewerCannotCreateInitialChecklistAnswer,
  CannotUpdateCheclistAnswerIfApproved,
  CannotUpdateCheclistAnswerIfNotLatest,
  OnlyReviewerChecklistSupportUpdateAnswerType,
  NotAllowedUpdateAnswerTypeInChecklistLifeCycle,
  CannotMutateOtherUsersChecklistAnswerException,
} from './exceptions/checklist-answer-exceptions.exception';
import { FileEntity } from '../file/file.entity';
import { FileAccessNotAllowedException } from '../file-label/exceptions/file-label-exceptions.exception';
import { FileLabelEntity } from '../file-label/file-label.entity';
import { LabelChecklistQuestionEntity } from '../label-checklist-question/label-checklist-question.entity';
import { ChecklistAnswerEntity } from './checklist-answer.entity';
import {
  AnswerData,
  SingleAnswerData,
} from './interface/answer-data.interface';

@Injectable()
export class ChecklistAnswerDomain {
  // Certain role allow to create certain type of checklist answer
  validateAnswerTypeRole(
    answerType: AnswerTypeEnum,
    accountInfo?: AccountInfo,
  ) {
    if (!accountInfo?.role) {
      throw new InvalidAnswerTypeForRole(answerType, accountInfo?.role as Role);
    }

    const roleToAnswerTypes: Partial<Record<Role, AnswerTypeEnum[]>> = {
      [Role.ANNOTATOR]: [AnswerTypeEnum.RESUBMITED, AnswerTypeEnum.SUBMIT],
      [Role.REVIEWER]: [AnswerTypeEnum.APPROVED, AnswerTypeEnum.REJECTED],
    };

    const allowedTypes = roleToAnswerTypes[accountInfo.role];
    if (!allowedTypes?.includes(answerType)) {
      throw new InvalidAnswerTypeForRole(answerType, accountInfo?.role as Role);
    }
  }

  validateFileAccess(file: FileEntity, accountInfo?: AccountInfo) {
    if (
      file.annotatorId !== accountInfo?.sub &&
      file.reviewerId !== accountInfo?.sub
    ) {
      throw new FileAccessNotAllowedException(file.id);
    }
  }

  validateChecklistAnswerLifeCycle(
    fileLabel: FileLabelEntity,
    providedAnswerType: AnswerTypeEnum,
    round?: number,
    role?: Role | null,
    type?: AnswerTypeEnum | null,
    accountInfo?: AccountInfo,
  ) {
    // Cannot create initial round from reviewer
    if (round === 0 && role === Role.REVIEWER) {
      throw new ReviewerCannotCreateInitialChecklistAnswer(fileLabel.id);
    }

    // Check if it's the current role's turn
    if (role === accountInfo?.role) {
      const followUpRole =
        role === Role.ANNOTATOR ? Role.REVIEWER : Role.ANNOTATOR;
      throw new NotInTurnToCreateChecklistAnswer(fileLabel.id, followUpRole);
    }

    // Workflow state machine: map previous answer type to allowed next types
    const answerTypeWorkflow: Record<
      AnswerTypeEnum | 'initial',
      AnswerTypeEnum[]
    > = {
      initial: [AnswerTypeEnum.SUBMIT],
      [AnswerTypeEnum.SUBMIT]: [
        AnswerTypeEnum.APPROVED,
        AnswerTypeEnum.REJECTED,
      ],
      [AnswerTypeEnum.RESUBMITED]: [
        AnswerTypeEnum.APPROVED,
        AnswerTypeEnum.REJECTED,
      ],
      [AnswerTypeEnum.REJECTED]: [AnswerTypeEnum.RESUBMITED],
      [AnswerTypeEnum.APPROVED]: [], // Terminal state
    };

    const currentState = type || 'initial';
    const allowedAnswerTypes = answerTypeWorkflow[currentState];

    // Check for terminal state
    if (allowedAnswerTypes.length === 0 && type === AnswerTypeEnum.APPROVED) {
      throw new ChecklistLifeCycleHasCompleted(fileLabel.id);
    }

    // Validate provided answer type is allowed
    if (!allowedAnswerTypes.includes(providedAnswerType)) {
      throw new AnswerTypeNotValidInChecklistLifeCycle();
    }
  }

  async validateAnswerData(
    questions: LabelChecklistQuestionEntity[],
    entity: ChecklistAnswerEntity,
    fileLabel: FileLabelEntity,
    answerData?: AnswerData,
    accountInfo?: AccountInfo,
  ) {
    if (!questions || questions.length === 0) {
      entity.answerData = {
        answers: [],
        notes: answerData?.notes || '',
      };
      return;
    }

    // Build question lookup maps for validation and snapshot building
    const questionsById = new Map(questions.map((q) => [q.id, q]));
    const requiredQuestionIds = new Set<string>();
    const allQuestionIds = new Set<string>();

    questions.forEach((q) => {
      allQuestionIds.add(q.id);
      if (q.isRequired) {
        requiredQuestionIds.add(q.id);
      }
    });

    let answeredRequiredCount = 0;
    const enrichedAnswers: any[] = [];

    answerData?.answers?.forEach((singleAnswerData: SingleAnswerData) => {
      const currentQuestionId = singleAnswerData?.questionId as string;

      // Validate question ID exists for this label/role
      if (!allQuestionIds.has(currentQuestionId)) {
        throw new InvalidQuestionIdInQuestionDataForThisLabelAndRole(
          accountInfo?.role as Role,
          fileLabel.labelId,
          currentQuestionId,
        );
      }

      const question = questionsById.get(currentQuestionId);

      // Build enriched answer with question snapshot
      const enrichedAnswer = {
        ...singleAnswerData,
        questionName: question?.name,
        questionDescription: question?.description,
        questionIsRequired: question?.isRequired,
        questionUpdatedAt: question?.updatedAt,
      };
      enrichedAnswers.push(enrichedAnswer);

      // Count answered required questions
      if (requiredQuestionIds.has(currentQuestionId)) {
        answeredRequiredCount++;
      }
    });

    // Verify all required questions are answered
    if (requiredQuestionIds.size !== answeredRequiredCount) {
      throw new InsufficientAnswerProvidedForRequiredQuestions();
    }

    // Persist enriched answer data with question snapshots
    entity.answerData = {
      answers: enrichedAnswers,
      notes: answerData?.notes || '',
    };
  }

  /**
   * Assign attempt/round number to entity
   * - If last was ANNOTATOR: next is REVIEWER (same round) → keep round
   * - If last was REVIEWER: next is ANNOTATOR (new round) → increment round
   * - If no prior attempts: first attempt → round = 0
   */
  setAttemptNumber(
    lastLabelAttemptNumber: number,
    lastLabelRole: Role | null,
    entity: ChecklistAnswerEntity,
  ) {
    if (lastLabelRole === Role.ANNOTATOR) {
      entity.labelAttemptNumber = lastLabelAttemptNumber; // Reviewer reviewing same attempt
    } else {
      entity.labelAttemptNumber = lastLabelAttemptNumber + 1; // Annotator starting new attempt
    }
  }

  /**
   * Validate ownership for delete operations
   * Only the owner or admin can delete
   */
  validateDeleteOwnership(
    entity: ChecklistAnswerEntity,
    accountInfo?: AccountInfo,
  ) {
    if (
      entity.answerById !== accountInfo?.sub &&
      accountInfo?.role !== Role.ADMIN
    ) {
      throw new CannotMutateOtherUsersChecklistAnswerException(entity.id);
    }
  }

  /**
   * Validate no later attempts exist before allowing delete
   */
  validateNoLaterAttempts(
    laterAttempt: ChecklistAnswerEntity | null,
    currentEntityId: string,
  ) {
    if (laterAttempt) {
      throw new CannotUpdateCheclistAnswerIfNotLatest(currentEntityId);
    }
  }

  /**
   * Validate basic update constraints
   */
  validateUpdateConstraints(
    entity: ChecklistAnswerEntity,
    updateDto: any,
    accountInfo?: AccountInfo,
    latestRound?: number,
    latestType?: AnswerTypeEnum | null,
  ) {
    // Block fileLabelId updates
    if (updateDto.fileLabelId && updateDto.fileLabelId !== entity.fileLabelId) {
      throw new InvalidChecklistAnswerException(
        'fileLabelId cannot be updated',
      );
    }

    // Cannot update if already approved
    if (entity.answerType === AnswerTypeEnum.APPROVED) {
      throw new CannotUpdateCheclistAnswerIfApproved(entity.id);
    }

    // Verify ownership
    if (entity.answerById !== accountInfo?.sub) {
      throw new CannotMutateOtherUsersChecklistAnswerException(entity.id);
    }

    // Cannot update if not latest attempt
    if (
      latestRound !== undefined &&
      entity.labelAttemptNumber !== latestRound
    ) {
      throw new CannotUpdateCheclistAnswerIfNotLatest(entity.id);
    }

    // Cannot update if someone else already responded after
    if (latestType !== undefined && latestType !== entity.answerType) {
      throw new CannotUpdateCheclistAnswerIfNotLatest(entity.id);
    }
  }

  /**
   * Validate reviewer's answerType update from REJECTED → APPROVED
   */
  validateAnswerTypeUpdate(
    entity: ChecklistAnswerEntity,
    newAnswerType: AnswerTypeEnum,
  ) {
    // Only reviewers can update answerType
    if (entity.roleType !== Role.REVIEWER) {
      throw new OnlyReviewerChecklistSupportUpdateAnswerType(entity.id);
    }

    // Can only transition from REJECTED → APPROVED
    if (
      entity.answerType !== AnswerTypeEnum.REJECTED ||
      newAnswerType !== AnswerTypeEnum.APPROVED
    ) {
      throw new NotAllowedUpdateAnswerTypeInChecklistLifeCycle(newAnswerType, [
        AnswerTypeEnum.APPROVED,
      ]);
    }
  }
}
