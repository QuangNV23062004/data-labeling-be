import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/service/base.service';
import { FileLabelRepository } from './file-label.repository';
import { AccountInfo } from 'src/interfaces/request';
import { FilterFileLabelQueryDto } from './dtos/filter-file-label-query.dto';
import { FileLabelEntity } from './file-label.entity';
import { PaginationResultDto } from 'src/common/pagination/pagination-result.dto';
import { CreateFileLabelDto } from './dtos/create-file-label.dto';
import { UpdateFileLabelDto } from './dtos/update-file-label.dto';
import {
  FileAccessNotAllowedException,
  FileLabelPairAlreadyExistsException,
  InvalidFileLabelException,
  LabelNotAllowedInProjectException,
  MissingRequiredFileLabelFieldException,
} from './exceptions/file-label-exceptions.exception';
import { FileRepository } from '../file/file.repository';
import { LabelRepository } from '../label/label.repository';
import { Role } from '../account/enums/role.enum';
import { AnnotatorSubmitDto } from './dtos/annotator-submit.dto';
import { FileLabelDomain } from './file-label.domain';
import { ChecklistAnswerRepository } from '../checklist-answer/checklist-answer.repository';
import { ChecklistAnswerDomain } from '../checklist-answer/checklist-answer.domain';
import { AnswerTypeEnum } from '../checklist-answer/enums/answer-type.enums';
import { ChecklistAnswerEntity } from '../checklist-answer/checklist-answer.entity';
import { LabelChecklistQuestionRepository } from '../label-checklist-question/label-checklist-question.repository';
import { ProjectConfigurationRepository } from '../project-configuration/project-configuration.repository';

@Injectable()
export class FileLabelService extends BaseService {
  constructor(
    private readonly repository: FileLabelRepository,
    private readonly fileRepository: FileRepository,
    private readonly labelRepository: LabelRepository,
    private readonly fileLabelDomain: FileLabelDomain,
    private readonly checklistAnswerRepository: ChecklistAnswerRepository,
    private readonly checklistAnswerDomain: ChecklistAnswerDomain,
    private readonly labelChecklistQuestionRepository: LabelChecklistQuestionRepository,
    private readonly projectConfigurationRepository: ProjectConfigurationRepository,
  ) {
    super();
  }

  async FindAll(
    query: FilterFileLabelQueryDto,
    includeDeleted: boolean = false,
    accountInfo?: AccountInfo,
  ): Promise<FileLabelEntity[]> {
    const safeIncludedDeleted = this.getIncludeDeleted(
      accountInfo,
      includeDeleted,
    );

    return this.repository.FindAll(query, safeIncludedDeleted);
  }

  async FindPaginated(
    query: FilterFileLabelQueryDto,
    includeDeleted: boolean = false,
    accountInfo?: AccountInfo,
  ): Promise<PaginationResultDto<FileLabelEntity>> {
    const safeIncludedDeleted = this.getIncludeDeleted(
      accountInfo,
      includeDeleted,
    );

    return this.repository.FindPaginated(query, safeIncludedDeleted);
  }

  async FindById(
    id: string,
    includeDeleted: boolean = false,
    accountInfo?: AccountInfo,
  ): Promise<FileLabelEntity | null> {
    const safeIncludedDeleted = this.getIncludeDeleted(
      accountInfo,
      includeDeleted,
    );

    return this.repository.FindById(id, safeIncludedDeleted);
  }

  async FindByIds(
    ids: string[],
    includeDeleted: boolean = false,
    accountInfo?: AccountInfo,
  ): Promise<FileLabelEntity[]> {
    const safeIncludedDeleted = this.getIncludeDeleted(
      accountInfo,
      includeDeleted,
    );

    return this.repository.FindByIds(ids, safeIncludedDeleted);
  }

  async Create(
    data: CreateFileLabelDto,
    accountInfo?: AccountInfo,
  ): Promise<FileLabelEntity> {
    const em = await this.repository.GetEntityManager();
    return em.transaction(async (transactionalEntityManager) => {
      const entity = Object.assign(new FileLabelEntity(), data);

      if (!data?.fileId) {
        throw new MissingRequiredFileLabelFieldException('fileId');
      }
      const file = await this.fileRepository.FindById(
        data.fileId,
        false,
        transactionalEntityManager,
      );

      this.fileLabelDomain.validateFileExist(file, data.fileId);

      data.fileId = file!.id;

      // Make labelId optional - only validate if provided
      if (data?.labelId) {
        const label = await this.labelRepository.FindById(
          data.labelId,
          false,
          transactionalEntityManager,
        );

        this.fileLabelDomain.validateLabelExist(label);

        data.labelId = label!.id;

        this.fileLabelDomain.validateFileAccess(file!, accountInfo);

        // Check if file already has this label assigned
        const existingFileLabel = await this.repository.FindByFileAndLabel(
          data.fileId,
          data.labelId,
          false,
          transactionalEntityManager,
        );

        this.fileLabelDomain.validateExistingFileLabel(
          existingFileLabel,
          data.fileId,
          data.labelId,
        );

        if (accountInfo?.role === Role.ANNOTATOR) {
          entity.annotatorId = accountInfo?.sub as string;
        }

        if (accountInfo?.role === Role.REVIEWER) {
          entity.reviewerId = accountInfo?.sub as string;
        }

        //allow admin to assign annotator and reviewer manually
        if (accountInfo?.role === Role.ADMIN) {
          if (!data.annotatorId) {
            throw new MissingRequiredFileLabelFieldException('annotatorId');
          }
          entity.annotatorId = data.annotatorId;
          if (data.reviewerId) {
            entity.reviewerId = data.reviewerId;
          }
        }
      } else {
        // When called from other services without accountInfo, use provided annotatorId
        if (data.annotatorId) {
          entity.annotatorId = data.annotatorId;
        }
        if (data.reviewerId) {
          entity.reviewerId = data.reviewerId;
        }
      }

      return this.repository.Create(entity, transactionalEntityManager);
    });
  }

  async Update(
    id: string,
    data: UpdateFileLabelDto,
    accountInfo?: AccountInfo,
  ): Promise<FileLabelEntity> {
    const em = await this.repository.GetEntityManager();
    return em.transaction(async (transactionalEntityManager) => {
      const entity = await this.repository.FindById(
        id,
        false,
        transactionalEntityManager,
      );

      this.fileLabelDomain.validateFileLabelNotFound(entity, id);

      if (
        entity?.file?.annotatorId !== accountInfo?.sub &&
        entity?.file?.reviewerId !== accountInfo?.sub &&
        accountInfo?.role !== Role.ADMIN
      ) {
        throw new FileAccessNotAllowedException(entity!.file.id);
      }

      // Check for duplicate file-label pair before mutating entity
      if (
        (data?.fileId && data.fileId !== entity!.fileId) ||
        (data?.labelId && data.labelId !== entity!.labelId)
      ) {
        const checkLabel = data?.labelId ? data.labelId : entity!.labelId;
        const checkFile = data?.fileId ? data.fileId : entity!.fileId;
        if (checkLabel && checkFile) {
          const existingFileLabel = await this.repository.FindByFileAndLabel(
            checkFile,
            checkLabel,
            false,
            transactionalEntityManager,
          );
          if (existingFileLabel && existingFileLabel.id !== entity!.id) {
            throw new FileLabelPairAlreadyExistsException(
              checkFile,
              checkLabel,
            );
          }
        }
      }

      Object.assign(entity!, data);
      if (data?.fileId) {
        const file = await this.fileRepository.FindById(
          data.fileId,
          false,
          transactionalEntityManager,
        );

        this.fileLabelDomain.validateFileExist(file, data.fileId);

        entity!.fileId = file!.id;
        entity!.file = file!;
      }

      if (data?.labelId) {
        const label = await this.labelRepository.FindById(
          data.labelId,
          false,
          transactionalEntityManager,
        );

        this.fileLabelDomain.validateLabelExist(label);

        entity!.labelId = label!.id;
        entity!.label = label!;
      }

      if (accountInfo?.role === Role.ANNOTATOR) {
        entity!.annotatorId = accountInfo?.sub as string;
      }
      if (accountInfo?.role === Role.REVIEWER) {
        entity!.reviewerId = accountInfo?.sub as string;
      }

      return this.repository.Update(entity!, transactionalEntityManager);
    });
  }

  async SoftDelete(id: string, accountInfo?: AccountInfo): Promise<boolean> {
    const em = await this.repository.GetEntityManager();
    return em.transaction(async (transactionalEntityManager) => {
      const entity = await this.repository.FindById(
        id,
        false,
        transactionalEntityManager,
      );

      this.fileLabelDomain.validateFileLabelNotFound(entity, id);

      this.fileLabelDomain.validateFileAccess(entity!.file, accountInfo);

      return this.repository.SoftDelete(id, transactionalEntityManager);
    });
  }

  async HardDelete(id: string, accountInfo?: AccountInfo): Promise<boolean> {
    this.validateAdminForHardDelete(accountInfo);

    const em = await this.repository.GetEntityManager();
    return em.transaction(async (transactionalEntityManager) => {
      const entity = await this.repository.FindById(
        id,
        true,
        transactionalEntityManager,
      );

      this.fileLabelDomain.validateFileLabelNotFound(entity, id);

      this.fileLabelDomain.validateFileLabelHasChecklistAnswers(entity!, id);

      return this.repository.HardDelete(id, transactionalEntityManager);
    });
  }

  async Restore(id: string, accountInfo?: AccountInfo): Promise<boolean> {
    const em = await this.repository.GetEntityManager();
    return em.transaction(async (transactionalEntityManager) => {
      const entity = await this.repository.FindById(
        id,
        true,
        transactionalEntityManager,
      );

      this.fileLabelDomain.validateFileLabelNotFound(entity, id);

      this.fileLabelDomain.validateLinkedFileAndLabelNotDeleted(entity!, id);

      return this.repository.Restore(id, transactionalEntityManager);
    });
  }

  async AnnotatorSubmit(dto: AnnotatorSubmitDto, accountInfo?: AccountInfo) {
    const em = await this.repository.GetEntityManager();
    return em.transaction(async (transactionalEntityManager) => {
      const file = await this.fileRepository.FindById(
        dto.fileId,
        false,
        transactionalEntityManager,
      );

      this.fileLabelDomain.validateFileExist(file, dto.fileId);

      const label = await this.labelRepository.FindById(
        dto.labelId,
        false,
        transactionalEntityManager,
      );

      const projectConfig =
        await this.projectConfigurationRepository.FindByProjectId(
          file!.projectId,
        );

      if (!projectConfig?.availableLabelIds.includes(dto.labelId)) {
        throw new LabelNotAllowedInProjectException(
          dto.labelId,
          file!.projectId,
        );
      }

      this.fileLabelDomain.validateLabelExist(label);

      this.fileLabelDomain.validateFileAccess(file!, accountInfo);

      let existingFileLabel =
        await this.repository.FindLabelByFileAndLabelAndAnnotatorId(
          dto.fileId,
          dto.labelId,
          accountInfo?.sub as string,
          false,
          transactionalEntityManager,
        );

      if (!existingFileLabel) {
        const entity: FileLabelEntity = Object.assign(new FileLabelEntity(), {
          fileId: dto.fileId,
          labelId: dto.labelId,
          annotatorId: accountInfo?.sub as string,
          reviewerId: file?.reviewerId,
          status: dto.status,
        });

        existingFileLabel = await this.repository.Create(
          entity,
          transactionalEntityManager,
        );
      } else {
        this.fileLabelDomain.validateFileLabelLifeCycleNotCompleted(
          existingFileLabel,
        );

        this.fileLabelDomain.validateFileLabelNotReassigned(existingFileLabel);

        const result = await this.repository.UpdateStatus(
          existingFileLabel.id,
          dto.status || existingFileLabel.status,
          transactionalEntityManager,
        );

        if (!result) {
          throw new InvalidFileLabelException(
            `Failed to update file label status to ${dto.status}`,
          );
        }
      }

      const { round, role, type } =
        await this.checklistAnswerRepository.GetLatestAttemptedLabelCounts(
          existingFileLabel.id,
          transactionalEntityManager,
        );

      const newType =
        round === 0 ? AnswerTypeEnum.SUBMIT : AnswerTypeEnum.RESUBMITED;

      this.checklistAnswerDomain.validateAnswerTypeRole(newType, accountInfo);

      this.checklistAnswerDomain.validateChecklistAnswerLifeCycle(
        existingFileLabel,
        newType,
        round,
        role,
        type,
        accountInfo,
      );

      const questions = await this.labelChecklistQuestionRepository.FindAll(
        {
          labelId: existingFileLabel.labelId ?? undefined,
          role: Role.ANNOTATOR,
        },
        false,
        transactionalEntityManager,
      );

      const entity: ChecklistAnswerEntity = Object.assign(
        new ChecklistAnswerEntity(),
        {
          fileLabelId: existingFileLabel.id,
          answerData: dto.answerData,
          answerType: newType,
          roleType: Role.ANNOTATOR,
          answerById: accountInfo?.sub as string,
        },
      );

      this.checklistAnswerDomain.validateAnswerData(
        questions,
        entity,
        existingFileLabel,
        dto.answerData,
        accountInfo,
      );

      this.checklistAnswerDomain.setAttemptNumber(round, role, entity);

      await this.checklistAnswerRepository.Create(
        entity,
        transactionalEntityManager,
      );
      return this.repository.FindById(
        existingFileLabel.id,
        false,
        transactionalEntityManager,
      );
    });
  }
}
