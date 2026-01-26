import { Injectable } from '@nestjs/common';
import { LabelPresetRepository } from './label-preset.repository';
import { CreateLabelPresetDto } from './dtos/create-label-preset.dto';
import { AccountInfo } from 'src/interfaces/request';
import { LabelPresetEntity } from './label-preset.entity';
import { LabelPresetExceptions } from './exceptions/label-preset-exceptions.exceptions';
import { BaseService } from 'src/common/service/base.service';
import { FilterLabelPresetQueryDto } from './dtos/filter-label-preset-query.dto';
import { PaginationResultDto } from 'src/common/pagination/pagination-result.dto';
import { UpdateLabelPresetDto } from './dtos/update-label-preset.dto';
import { LabelRepository } from '../label/label.repository';

@Injectable()
export class LabelPresetService extends BaseService {
  constructor(
    private readonly labelPresetRepository: LabelPresetRepository,
    private readonly labelRepository: LabelRepository,
  ) {
    super();
  }

  async Create(
    labelPresetDto: CreateLabelPresetDto,
    accountInfo?: AccountInfo,
  ) {
    const em = await this.labelPresetRepository.GetEntityManager();
    return em.transaction(async (transactionalEntityManager) => {
      const existingLabelPreset = await this.labelPresetRepository.FindByName(
        labelPresetDto.name,
        false,
        undefined,
        transactionalEntityManager,
      );
      if (existingLabelPreset) {
        throw LabelPresetExceptions.LABEL_PRESET_NAME_ALREADY_EXISTED;
      }

      const labelPresetEntity: LabelPresetEntity =
        Object.assign(labelPresetDto);

      const labels = await this.labelRepository.FindByIds(
        labelPresetDto.labelIds,
        false,
        transactionalEntityManager,
      );
      if (labels.length !== labelPresetDto.labelIds.length) {
        throw LabelPresetExceptions.LABEL_NOT_FOUND;
      }
      labelPresetEntity.labels = labels;
      labelPresetEntity.createdById = accountInfo?.sub as string;
      const labelPreset = this.labelPresetRepository.Create(
        labelPresetEntity,
        transactionalEntityManager,
      );
      return labelPreset;
    });
  }

  async FindAll(
    query: FilterLabelPresetQueryDto,
    includeDeleted?: boolean,
    accountInfo?: AccountInfo,
  ): Promise<LabelPresetEntity[]> {
    const safeIncludeDeleted = this.getIncludeDeleted(
      accountInfo,
      includeDeleted,
    );

    return await this.labelPresetRepository.FindAll(query, safeIncludeDeleted);
  }

  async FindPaginated(
    query: FilterLabelPresetQueryDto,
    includeDeleted?: boolean,
    accountInfo?: AccountInfo,
  ): Promise<PaginationResultDto<LabelPresetEntity>> {
    const safeIncludeDeleted = this.getIncludeDeleted(
      accountInfo,
      includeDeleted,
    );

    return await this.labelPresetRepository.FindPaginated(
      query,
      safeIncludeDeleted,
    );
  }

  async FindById(
    id: string,
    includeDeleted?: boolean,
    accountInfo?: AccountInfo,
  ): Promise<LabelPresetEntity> {
    const safeIncludeDeleted = this.getIncludeDeleted(
      accountInfo,
      includeDeleted,
    );
    const result = await this.labelPresetRepository.FindById(
      id,
      safeIncludeDeleted,
    );
    if (!result) {
      throw LabelPresetExceptions.LABEL_PRESET_NOT_FOUND;
    }
    return result;
  }

  async Update(
    id: string,
    labelPresetDto: UpdateLabelPresetDto,
    accountInfo?: AccountInfo,
  ): Promise<LabelPresetEntity> {
    const em = this.labelPresetRepository.GetEntityManager();
    return (await em).transaction(async (transactionalEntityManager) => {
      const result = await this.labelPresetRepository.FindById(
        id,
        false,
        transactionalEntityManager,
      );

      if (!result) {
        throw LabelPresetExceptions.LABEL_PRESET_NOT_FOUND;
      }

      const oldLabels = result.labels.map((label) => label.id);
      const updatedLabelPreset = Object.assign(result, labelPresetDto);

      // Check if labelIds have actually changed by comparing array contents
      const labelsHaveChanged =
        labelPresetDto?.labelIds &&
        (oldLabels.length !== labelPresetDto.labelIds.length ||
          !oldLabels.every((id) => labelPresetDto.labelIds!.includes(id)));

      if (labelsHaveChanged) {
        const labels = await this.labelRepository.FindByIds(
          labelPresetDto.labelIds!,
          false,
          transactionalEntityManager,
        );
        if (labels.length !== labelPresetDto.labelIds!.length) {
          throw LabelPresetExceptions.LABEL_NOT_FOUND;
        }
        updatedLabelPreset.labels = labels;
      }

      return await this.labelPresetRepository.Update(
        updatedLabelPreset,
        transactionalEntityManager,
      );
    });
  }

  async SoftDelete(id: string, accountInfo?: AccountInfo): Promise<boolean> {
    const em = this.labelPresetRepository.GetEntityManager();
    return (await em).transaction(async (transactionalEntityManager) => {
      const result = await this.labelPresetRepository.FindById(
        id,
        false,
        transactionalEntityManager,
      );

      if (!result) {
        throw LabelPresetExceptions.LABEL_PRESET_NOT_FOUND;
      }

      return await this.labelPresetRepository.SoftDelete(
        id,
        transactionalEntityManager,
      );
    });
  }

  async Restore(id: string, accountInfo?: AccountInfo): Promise<boolean> {
    const em = this.labelPresetRepository.GetEntityManager();
    return (await em).transaction(async (transactionalEntityManager) => {
      const result = await this.labelPresetRepository.FindById(
        id,
        true,
        transactionalEntityManager,
      );

      if (!result) {
        throw LabelPresetExceptions.LABEL_PRESET_NOT_FOUND;
      }

      if (result.labels.find((label) => label.deletedAt !== null)) {
        throw LabelPresetExceptions.LABEL_PRESET_STILL_HAS_INCLUDE_DELETED_LABELS;
      }
      return await this.labelPresetRepository.Restore(
        id,
        transactionalEntityManager,
      );
    });
  }

  async HardDelete(id: string, accountInfo?: AccountInfo): Promise<boolean> {
    const em = this.labelPresetRepository.GetEntityManager();
    return (await em).transaction(async (transactionalEntityManager) => {
      const result = await this.labelPresetRepository.FindById(
        id,
        true,
        transactionalEntityManager,
      );

      if (!result) {
        throw LabelPresetExceptions.LABEL_PRESET_NOT_FOUND;
      }

      return await this.labelPresetRepository.HardDelete(
        id,
        transactionalEntityManager,
      );
    });
  }
}
