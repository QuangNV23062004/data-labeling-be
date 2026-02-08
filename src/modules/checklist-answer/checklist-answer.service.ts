import { Injectable } from '@nestjs/common';
import { ChecklistAnswerRepository } from './checklist-answer.repository';
import { BaseService } from 'src/common/service/base.service';
import { CreateChecklistAnswerDto } from './dtos/create-checklist-answer.dto';
import { ChecklistAnswerEntity } from './checklist-answer.entity';
import { UpdateChecklistAnswerDto } from './dtos/update-checklist-answer.dto';
import {
  ChecklistAnswerNotFoundException,
  CannotMutateOtherUsersChecklistAnswerException,
  CannotUpdateCheclistAnswerIfNotLatest,
} from './exceptions/checklist-answer-exceptions.exception';
import { AccountInfo } from 'src/interfaces/request';
import { FileLabelRepository } from '../file-label/file-label.repository';
import { LabelChecklistQuestionRepository } from '../label-checklist-question/label-checklist-question.repository';
import {
  FileAccessNotAllowedException,
  FileLabelNotFoundException,
} from '../file-label/exceptions/file-label-exceptions.exception';
import { Role } from '../account/enums/role.enum';
import { AnswerTypeEnum } from './enums/answer-type.enums';
import { ChecklistAnswerDomain } from './checklist-answer.domain';
import { IsNull, MoreThan } from 'typeorm';
import { PaginationResultDto } from 'src/common/pagination/pagination-result.dto';

@Injectable()
export class ChecklistAnswerService extends BaseService {
  constructor(
    private readonly checklistAnswerRepository: ChecklistAnswerRepository,
    private readonly fileLabelRepository: FileLabelRepository,
    private readonly labelChecklistQuestionRepository: LabelChecklistQuestionRepository,
    private readonly checklistAnswerDomain: ChecklistAnswerDomain,
  ) {
    super();
  }

  async Create(
    createDto: CreateChecklistAnswerDto,
    accountInfo?: AccountInfo,
  ): Promise<ChecklistAnswerEntity> {
    const em = await this.checklistAnswerRepository.GetEntityManager();
    return await em.transaction(async (transactionalEntityManager) => {
      const entity: ChecklistAnswerEntity = Object.assign(
        new ChecklistAnswerEntity(),
        {
          ...createDto,
        },
      );

      this.checklistAnswerDomain.validateAnswerTypeRole(
        createDto.answerType,
        accountInfo,
      );

      const fileLabel = await this.fileLabelRepository.FindById(
        createDto.fileLabelId,
        false,
        transactionalEntityManager,
      );

      if (!fileLabel) {
        throw new FileLabelNotFoundException(createDto.fileLabelId);
      }

      //file access
      this.checklistAnswerDomain.validateFileAccess(
        fileLabel.file,
        accountInfo,
      );

      entity.fileLabelId = fileLabel.id;
      entity.fileLabel = fileLabel;
      // Assign role and owner
      entity.roleType = accountInfo?.role as Role;
      entity.answerById = accountInfo?.sub as string;

      //round cta and role check, follow up flow
      const { round, role, type } =
        await this.checklistAnswerRepository.GetLatestAttemptedLabelCounts(
          fileLabel.id,
          transactionalEntityManager,
        );

      this.checklistAnswerDomain.validateChecklistAnswerLifeCycle(
        fileLabel,
        createDto.answerType,
        round,
        role,
        type,
        accountInfo,
      );

      //get all questions for this label target this role
      const questions = await this.labelChecklistQuestionRepository.FindAll(
        {
          labelId: fileLabel.labelId,
          role: accountInfo?.role as Role,
        },
        false,
        transactionalEntityManager,
      );

      this.checklistAnswerDomain.validateAnswerData(
        questions,
        entity,
        fileLabel,
        createDto.answerData,
        accountInfo,
      );

      this.checklistAnswerDomain.setAttemptNumber(round, role as Role, entity);

      const checklistAnswer = this.checklistAnswerRepository.Create(
        entity,
        transactionalEntityManager,
      );
      return checklistAnswer;
    });
  }

  async Update(
    id: string,
    updateDto: UpdateChecklistAnswerDto,
    accountInfo?: AccountInfo,
  ): Promise<ChecklistAnswerEntity> {
    const em = await this.checklistAnswerRepository.GetEntityManager();

    return await em.transaction(async (transactionalEntityManager) => {
      const entity = await this.checklistAnswerRepository.FindByIdWithLock(
        id,
        false,
        transactionalEntityManager,
      );
      if (!entity) throw new ChecklistAnswerNotFoundException(id);

      // Get attempt context
      const { round, type, role } =
        await this.checklistAnswerRepository.GetLatestAttemptedLabelCounts(
          entity.fileLabelId,
          transactionalEntityManager,
        );

      // Step 1: Validate basic update eligibility
      this.checklistAnswerDomain.validateUpdateConstraints(
        entity,
        updateDto,
        accountInfo,
        round,
        type,
      );

      // Step 2: Handle answerType update (REJECTED → APPROVED only)
      if (updateDto.answerType) {
        // Service orchestrates both validations explicitly
        this.checklistAnswerDomain.validateAnswerTypeRole(
          updateDto.answerType,
          accountInfo,
        );
        // This already validates the specific transition (REJECTED → APPROVED)
        // No need to re-validate full lifecycle state machine for updates
        this.checklistAnswerDomain.validateAnswerTypeUpdate(
          entity,
          updateDto.answerType,
        );

        entity.answerType = updateDto.answerType;
      }

      // Step 3: Handle answerData update
      if (updateDto.answerData) {
        if (!entity.fileLabel) {
          const fileLabel = await this.fileLabelRepository.FindById(
            entity.fileLabelId,
            false,
            transactionalEntityManager,
          );
          if (!fileLabel) {
            throw new FileLabelNotFoundException(entity.fileLabelId);
          }
          entity.fileLabel = fileLabel;
        }

        const questions = await this.labelChecklistQuestionRepository.FindAll(
          {
            labelId: entity.fileLabel.labelId,
            role: entity.roleType as Role,
          },
          false,
          transactionalEntityManager,
        );

        // Revalidate answer data with current questions
        this.checklistAnswerDomain.validateAnswerData(
          questions,
          entity,
          entity.fileLabel,
          updateDto.answerData,
          { ...accountInfo, role: entity.roleType } as AccountInfo,
        );
      }

      return this.checklistAnswerRepository.Update(
        entity,
        transactionalEntityManager,
      );
    });
  }

  async SoftDelete(id: string, accountInfo?: AccountInfo): Promise<void> {
    const em = await this.checklistAnswerRepository.GetEntityManager();

    return await em.transaction(async (transactionalEntityManager) => {
      const entity = await this.checklistAnswerRepository.FindByIdWithLock(
        id,
        false,
        transactionalEntityManager,
      );
      if (!entity) throw new ChecklistAnswerNotFoundException(id);

      // Validate ownership (only owner or admin can delete)
      this.checklistAnswerDomain.validateDeleteOwnership(entity, accountInfo);

      // Prevent delete if later attempts exist
      const laterAttempt =
        await this.checklistAnswerRepository.HasLaterAttempts(
          entity.fileLabelId,
          entity.labelAttemptNumber,
          false,
          transactionalEntityManager,
        );

      this.checklistAnswerDomain.validateNoLaterAttempts(
        laterAttempt,
        entity.id,
      );

      await this.checklistAnswerRepository.SoftDelete(
        id,
        transactionalEntityManager,
      );
    });
  }

  async Restore(id: string, accountInfo?: AccountInfo): Promise<void> {
    const em = await this.checklistAnswerRepository.GetEntityManager();
    return await em.transaction(async (transactionalEntityManager) => {
      const entity = await this.checklistAnswerRepository.FindByIdWithLock(
        id,
        true,
        transactionalEntityManager,
      );

      if (!entity) {
        throw new ChecklistAnswerNotFoundException(id);
      }

      // Note: No ownership check - admin restoration only enforced at controller/guard level

      await this.checklistAnswerRepository.Restore(
        id,
        transactionalEntityManager,
      );
    });
  }

  async HardDelete(id: string, accountInfo?: AccountInfo): Promise<void> {
    const em = await this.checklistAnswerRepository.GetEntityManager();
    return await em.transaction(async (transactionalEntityManager) => {
      const entity = await this.checklistAnswerRepository.FindByIdWithLock(
        id,
        true,
        transactionalEntityManager,
      );

      if (!entity) {
        throw new ChecklistAnswerNotFoundException(id);
      }

      // Validate ownership (only owner or admin can hard delete)
      this.checklistAnswerDomain.validateDeleteOwnership(entity, accountInfo);

      // Prevent delete if later attempts exist (including soft-deleted)
      const laterAttempt =
        await this.checklistAnswerRepository.HasLaterAttempts(
          entity.fileLabelId,
          entity.labelAttemptNumber,
          true,
          transactionalEntityManager,
        );

      this.checklistAnswerDomain.validateNoLaterAttempts(
        laterAttempt,
        entity.id,
      );

      await this.checklistAnswerRepository.HardDelete(
        id,
        transactionalEntityManager,
      );
    });
  }

  async FindAll(
    query: any,
    includeDeleted: boolean,
    accountInfo?: AccountInfo,
  ): Promise<ChecklistAnswerEntity[]> {
    const includeDel = this.getIncludeDeleted(accountInfo, includeDeleted);
    return this.checklistAnswerRepository.FindAll(query, includeDel);
  }

  async FindPaginated(
    query: any,
    includeDeleted: boolean,
    accountInfo?: AccountInfo,
  ): Promise<PaginationResultDto<ChecklistAnswerEntity>> {
    const includeDel = this.getIncludeDeleted(accountInfo, includeDeleted);
    return await this.checklistAnswerRepository.FindPaginated(
      query,
      includeDel,
    );
  }

  async FindById(
    id: string,
    includeDeleted: boolean,
    accountInfo?: AccountInfo,
  ): Promise<ChecklistAnswerEntity | null> {
    const includeDel = this.getIncludeDeleted(accountInfo, includeDeleted);
    return this.checklistAnswerRepository.FindById(id, includeDel);
  }
}
