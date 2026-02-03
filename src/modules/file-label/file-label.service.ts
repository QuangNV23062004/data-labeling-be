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
  FileLabelNotFoundException,
  MissingRequiredFileLabelFieldException,
} from './exceptions/file-label-exceptions.exception';
import { FileRepository } from '../file/file.repository';
import { LabelRepository } from '../label/label.repository';
import { FileNotFoundException } from '../file/exceptions/file-exceptions.exception';
import { LabelNotFoundException } from '../label/exceptions/label-exceptions.exceptions';

@Injectable()
export class FileLabelService extends BaseService {
  constructor(
    private readonly repository: FileLabelRepository,
    private readonly fileRepository: FileRepository,
    private readonly labelRepository: LabelRepository,
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

  // TODO: Consider adding checklist questions bulk creation along with file labels
  // TODO:
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

      if (!file) {
        throw new FileNotFoundException(data.fileId);
      }

      data.fileId = file.id;

      if (!data?.labelId) {
        throw new MissingRequiredFileLabelFieldException('labelId');
      }

      const label = await this.labelRepository.FindById(
        data.labelId,
        false,
        transactionalEntityManager,
      );

      if (!label) {
        throw new LabelNotFoundException();
      }

      data.labelId = label.id;

      entity.annotatorId = accountInfo?.sub as string;

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

      if (!entity) {
        throw new FileLabelNotFoundException(id);
      }

      Object.assign(entity, data);
      if (data?.fileId) {
        const file = await this.fileRepository.FindById(
          data.fileId,
          false,
          transactionalEntityManager,
        );

        if (!file) {
          throw new FileNotFoundException(data.fileId);
        }

        data.fileId = file.id;
      }

      if (data?.labelId) {
        const label = await this.labelRepository.FindById(
          data.labelId,
          false,
          transactionalEntityManager,
        );

        if (!label) {
          throw new LabelNotFoundException();
        }
        data.labelId = label.id;
      }

      return this.repository.Update(entity, transactionalEntityManager);
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

      if (!entity) {
        throw new FileLabelNotFoundException(id);
      }

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

      if (!entity) {
        throw new FileLabelNotFoundException(id);
      }

      // TODO: Add business logic check - cannot delete if fileLabel has checklist answers

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

      if (!entity) {
        throw new FileLabelNotFoundException(id);
      }

      // TODO: Add validation checks (e.g., file and label must not be deleted)

      return this.repository.Restore(id, transactionalEntityManager);
    });
  }
}
