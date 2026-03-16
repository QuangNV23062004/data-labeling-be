import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, IsNull, Not, Repository } from 'typeorm';
import { FileLabelEntity } from './file-label.entity';
import { FilterFileLabelQueryDto } from './dtos/filter-file-label-query.dto';
import { PaginationResultDto } from 'src/common/pagination/pagination-result.dto';
import { FileLabelStatusEnums } from './enums/file-label.enums';
import { ChecklistAnswerEntity } from '../checklist-answer/checklist-answer.entity';
import { ReviewEntity } from '../review/review.entity';
import { ReviewErrorEntity } from '../review-error/review-error.entity';
import { ReviewErrorTypeEntity } from '../review-error-type/review-error-type.entity';
import { ProjectAnnotatorErrorBreakdownRow } from 'src/types/project-annotator-break-down.types';
import { ProjectAnnotatorMetricsRow } from 'src/types/project-annotator-metric.types';
import { AccountRatingMetricsRow } from 'src/types/account-rating-metric-row.types';
import { AccountRatingErrorBreakdownRow } from 'src/types/account-rating-error-breakdown-row.types';

@Injectable()
export class FileLabelRepository extends BaseRepository<FileLabelEntity> {
  constructor(
    @InjectRepository(FileLabelEntity)
    repository: Repository<FileLabelEntity>,
  ) {
    super(repository, FileLabelEntity);
  }

  async FindAll(
    query: FilterFileLabelQueryDto,
    includeDeleted: boolean,
    em?: EntityManager,
    excludeReassigned: boolean = true,
  ): Promise<FileLabelEntity[]> {
    const repository = await this.GetRepository(em);
    const qb = repository.createQueryBuilder('fileLabel');

    if (query?.fileId) {
      qb.andWhere('fileLabel.fileId = :fileId', { fileId: query.fileId });
    }

    if (query?.labelId) {
      qb.andWhere('fileLabel.labelId = :labelId', { labelId: query.labelId });
    }

    if (query?.annotatorId) {
      qb.andWhere('fileLabel.annotatorId = :annotatorId', {
        annotatorId: query.annotatorId,
      });
    }

    if (query?.reviewerId) {
      qb.andWhere('fileLabel.reviewerId = :reviewerId', {
        reviewerId: query.reviewerId,
      });
    }

    if (query?.status) {
      qb.andWhere('fileLabel.status = :status', { status: query.status });
    } else if (excludeReassigned) {
      qb.andWhere('fileLabel.status != :status', {
        status: FileLabelStatusEnums.REASSIGNED,
      });
    }

    if (query?.search && query?.searchBy) {
      qb.andWhere(`fileLabel.${query.searchBy} ILIKE unaccent(:search)`, {
        search: `%${query.search}%`,
      });
    }

    if (query?.order && query?.orderBy) {
      qb.orderBy(
        `fileLabel.${query.orderBy}`,
        query.order.toUpperCase() as 'ASC' | 'DESC',
      );
    }

    if (!includeDeleted) {
      qb.andWhere('fileLabel.deletedAt IS NULL');
      qb.leftJoinAndSelect('fileLabel.file', 'file', 'file.deletedAt IS NULL');
      qb.leftJoinAndSelect(
        'fileLabel.label',
        'label',
        'label.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'fileLabel.annotator',
        'annotator',
        'annotator.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'fileLabel.reviewer',
        'reviewer',
        'reviewer.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'fileLabel.checklistAnswers',
        'checklistAnswers',
        'checklistAnswers.deletedAt IS NULL',
      );
    } else {
      qb.leftJoinAndSelect('fileLabel.file', 'file');
      qb.leftJoinAndSelect('fileLabel.label', 'label');
      qb.leftJoinAndSelect('fileLabel.annotator', 'annotator');
      qb.leftJoinAndSelect('fileLabel.reviewer', 'reviewer');
      qb.leftJoinAndSelect('fileLabel.checklistAnswers', 'checklistAnswers');
    }

    if (query?.projectId) {
      qb.andWhere('file.projectId = :projectId', {
        projectId: query.projectId,
      });
    }

    return await qb.getMany();
  }

  async FindPaginated(
    query: FilterFileLabelQueryDto,
    includeDeleted: boolean,
    em?: EntityManager,
    excludeReassigned: boolean = true,
  ): Promise<PaginationResultDto<FileLabelEntity>> {
    const repository = await this.GetRepository(em);
    const qb = repository.createQueryBuilder('fileLabel');

    if (query?.fileId) {
      qb.andWhere('fileLabel.fileId = :fileId', { fileId: query.fileId });
    }

    if (query?.labelId) {
      qb.andWhere('fileLabel.labelId = :labelId', { labelId: query.labelId });
    }

    if (query?.annotatorId) {
      qb.andWhere('fileLabel.annotatorId = :annotatorId', {
        annotatorId: query.annotatorId,
      });
    }

    if (query?.reviewerId) {
      qb.andWhere('fileLabel.reviewerId = :reviewerId', {
        reviewerId: query.reviewerId,
      });
    }

    if (query?.status) {
      qb.andWhere('fileLabel.status = :status', { status: query.status });
    } else if (excludeReassigned) {
      qb.andWhere('fileLabel.status != :status', {
        status: FileLabelStatusEnums.REASSIGNED,
      });
    }

    if (query?.search && query?.searchBy) {
      qb.andWhere(`fileLabel.${query.searchBy} ILIKE unaccent(:search)`, {
        search: `%${query.search}%`,
      });
    }

    if (query?.order && query?.orderBy) {
      qb.orderBy(
        `fileLabel.${query.orderBy}`,
        query.order.toUpperCase() as 'ASC' | 'DESC',
      );
    }

    if (!includeDeleted) {
      qb.andWhere('fileLabel.deletedAt IS NULL');
      qb.leftJoinAndSelect('fileLabel.file', 'file', 'file.deletedAt IS NULL');
      qb.leftJoinAndSelect(
        'fileLabel.label',
        'label',
        'label.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'fileLabel.annotator',
        'annotator',
        'annotator.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'fileLabel.reviewer',
        'reviewer',
        'reviewer.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'fileLabel.checklistAnswers',
        'checklistAnswers',
        'checklistAnswers.deletedAt IS NULL',
      );
    } else {
      qb.leftJoinAndSelect('fileLabel.file', 'file');
      qb.leftJoinAndSelect('fileLabel.label', 'label');
      qb.leftJoinAndSelect('fileLabel.annotator', 'annotator');
      qb.leftJoinAndSelect('fileLabel.reviewer', 'reviewer');
      qb.leftJoinAndSelect('fileLabel.checklistAnswers', 'checklistAnswers');
    }

    if (query?.projectId) {
      qb.andWhere('file.projectId = :projectId', {
        projectId: query.projectId,
      });
    }

    const total = await qb.getCount();
    const safePage = query?.page ?? 1;
    const safeLimit = query?.limit ?? 10;
    const offset = (safePage - 1) * safeLimit;
    const items = await qb.skip(offset).take(safeLimit).getMany();

    const totalPage = Math.ceil(total / safeLimit);
    return new PaginationResultDto<FileLabelEntity>(
      items,
      totalPage,
      safePage,
      safeLimit,
      query?.search || '',
      query?.searchBy || 'id',
      query?.order || 'DESC',
      query?.orderBy || 'createdAt',
      safePage < totalPage,
      safePage > 1,
    );
  }

  async FindById(
    id: string,
    includeDeleted: boolean,
    em?: EntityManager,
  ): Promise<FileLabelEntity | null> {
    const repository = await this.GetRepository(em);
    const qb = repository.createQueryBuilder('fileLabel');

    qb.where('fileLabel.id = :id', { id });

    if (!includeDeleted) {
      qb.andWhere('fileLabel.deletedAt IS NULL');
      qb.leftJoinAndSelect('fileLabel.file', 'file', 'file.deletedAt IS NULL');
      qb.leftJoinAndSelect(
        'fileLabel.label',
        'label',
        'label.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'fileLabel.annotator',
        'annotator',
        'annotator.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'fileLabel.reviewer',
        'reviewer',
        'reviewer.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'fileLabel.checklistAnswers',
        'checklistAnswers',
        'checklistAnswers.deletedAt IS NULL',
      );
    } else {
      qb.leftJoinAndSelect('fileLabel.file', 'file');
      qb.leftJoinAndSelect('fileLabel.label', 'label');
      qb.leftJoinAndSelect('fileLabel.annotator', 'annotator');
      qb.leftJoinAndSelect('fileLabel.reviewer', 'reviewer');
      qb.leftJoinAndSelect('fileLabel.checklistAnswers', 'checklistAnswers');
    }

    return await qb.getOne();
  }

  async FindByIds(
    ids: string[],
    includeDeleted: boolean,
    em?: EntityManager,
  ): Promise<FileLabelEntity[]> {
    const repository = await this.GetRepository(em);
    const qb = repository.createQueryBuilder('fileLabel');

    if (ids.length === 0) {
      return [];
    }

    qb.where('fileLabel.id IN (:...ids)', { ids });

    if (!includeDeleted) {
      qb.andWhere('fileLabel.deletedAt IS NULL');
      qb.leftJoinAndSelect('fileLabel.file', 'file', 'file.deletedAt IS NULL');
      qb.leftJoinAndSelect(
        'fileLabel.label',
        'label',
        'label.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'fileLabel.annotator',
        'annotator',
        'annotator.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'fileLabel.reviewer',
        'reviewer',
        'reviewer.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'fileLabel.checklistAnswers',
        'checklistAnswers',
        'checklistAnswers.deletedAt IS NULL',
      );
    } else {
      qb.leftJoinAndSelect('fileLabel.file', 'file');
      qb.leftJoinAndSelect('fileLabel.label', 'label');
      qb.leftJoinAndSelect('fileLabel.annotator', 'annotator');
      qb.leftJoinAndSelect('fileLabel.reviewer', 'reviewer');
      qb.leftJoinAndSelect('fileLabel.checklistAnswers', 'checklistAnswers');
    }

    return await qb.getMany();
  }

  /**
   * Find a file-label pair by fileId and labelId
   * Used to prevent duplicate file-label assignments
   */
  async FindByFileAndLabel(
    fileId: string,
    labelId: string,
    includeDeleted: boolean = false,
    em?: EntityManager,
  ): Promise<FileLabelEntity | null> {
    const repository = await this.GetRepository(em);

    const whereClause = includeDeleted
      ? { fileId, labelId }
      : { fileId, labelId, deletedAt: IsNull() };

    return repository.findOne({
      where: whereClause,
    });
  }

  async Create(
    data: FileLabelEntity,
    em?: EntityManager,
  ): Promise<FileLabelEntity> {
    const repository = await this.GetRepository(em);
    return await repository.save(data);
  }

  async Update(
    data: FileLabelEntity,
    em?: EntityManager,
  ): Promise<FileLabelEntity> {
    const repository = await this.GetRepository(em);
    return await repository.save(data);
  }

  async SoftDelete(id: string, em?: EntityManager): Promise<boolean> {
    const repository = await this.GetRepository(em);
    const result = await repository.update(id, { deletedAt: new Date() });
    return result?.affected !== undefined && result?.affected > 0;
  }

  async HardDelete(id: string, em?: EntityManager): Promise<boolean> {
    const repository = await this.GetRepository(em);
    const result = await repository.delete(id);
    return result?.affected !== undefined && (result?.affected as number) > 0;
  }

  async Restore(id: string, em?: EntityManager): Promise<boolean> {
    const repository = await this.GetRepository(em);
    const result = await repository.update(id, { deletedAt: null });
    return result?.affected !== undefined && result?.affected > 0;
  }

  async FindExistingFileLabel(
    fileId: string,
    labelId: string,
    annotatorId: string,
    includeDeleted: boolean,
    em?: EntityManager,
  ): Promise<FileLabelEntity | null> {
    const repository = await this.GetRepository(em);
    const whereCondition: any = {
      fileId,
      labelId,
      annotatorId,
    };

    if (!includeDeleted) {
      whereCondition.deletedAt = IsNull();
    }

    return await repository.findOne({
      where: whereCondition,
    });
  }

  async FindLabelByFileAndLabelAndAnnotatorId(
    fileId: string,
    labelId: string,
    annotatorId: string,
    includeDeleted: boolean,
    em?: EntityManager,
  ): Promise<FileLabelEntity | null> {
    const repository = await this.GetRepository(em);
    const qb = repository.createQueryBuilder('fileLabel');

    qb.where('fileLabel.fileId = :fileId', { fileId });
    qb.andWhere('fileLabel.labelId = :labelId', { labelId });
    qb.andWhere('fileLabel.annotatorId = :annotatorId', { annotatorId });
    if (!includeDeleted) {
      qb.andWhere('fileLabel.deletedAt IS NULL');
      qb.leftJoinAndSelect('fileLabel.file', 'file', 'file.deletedAt IS NULL');
      qb.leftJoinAndSelect(
        'fileLabel.label',
        'label',
        'label.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'fileLabel.annotator',
        'annotator',
        'annotator.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'fileLabel.reviewer',
        'reviewer',
        'reviewer.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'fileLabel.checklistAnswers',
        'checklistAnswers',
        'checklistAnswers.deletedAt IS NULL',
      );
    } else {
      qb.leftJoinAndSelect('fileLabel.file', 'file');
      qb.leftJoinAndSelect('fileLabel.label', 'label');
      qb.leftJoinAndSelect('fileLabel.annotator', 'annotator');
      qb.leftJoinAndSelect('fileLabel.reviewer', 'reviewer');
      qb.leftJoinAndSelect('fileLabel.checklistAnswers', 'checklistAnswers');
    }

    return await qb.getOne();
  }

  //for some reason, failed to use update, so yeah
  async UpdateStatus(
    id: string,
    status: FileLabelStatusEnums,
    em?: EntityManager,
  ): Promise<FileLabelEntity | null> {
    const repository = await this.GetRepository(em);
    const fileLabel = await repository.update({ id }, { status });
    if (fileLabel.affected && fileLabel.affected > 0) {
      return await repository.findOne({ where: { id } });
    }
    return null;
  }

  async UpdateStatusAndReviewer(
    id: string,
    status: FileLabelStatusEnums,
    reviewerId: string,
    em?: EntityManager,
  ): Promise<FileLabelEntity | null> {
    const repository = await this.GetRepository(em);
    const fileLabel = await repository.update({ id }, { status, reviewerId });
    if (fileLabel.affected && fileLabel.affected > 0) {
      return await repository.findOne({ where: { id } });
    }
    return null;
  }

  async BatchUpdateStatus(
    ids: string[],
    status: FileLabelStatusEnums,
    em?: EntityManager,
  ): Promise<boolean> {
    const repository = await this.GetRepository(em);
    const result = await repository.update({ id: In(ids) }, { status });
    return result?.affected !== undefined && (result?.affected as number) > 0;
  }

  async BatchUpdateReviewerByFileId(
    fileId: string,
    reviewerId: string,
    em?: EntityManager,
  ): Promise<boolean> {
    const repository = await this.GetRepository(em);
    const result = await repository.update(
      {
        fileId,
        deletedAt: IsNull(),
        status: Not(FileLabelStatusEnums.REASSIGNED),
      },
      { reviewerId },
    );

    return result?.affected !== undefined && (result?.affected as number) > 0;
  }

  //use for account rating calculation, get all file labels for a specific annotator in a project
  async FindByProjectIdAndAnnotatorId(
    projectId: string,
    annotatorId: string,
    includeDeleted: boolean,
    em?: EntityManager,
  ): Promise<FileLabelEntity[]> {
    const repository = await this.GetRepository(em);
    const qb = repository.createQueryBuilder('fileLabel');

    qb.leftJoinAndSelect('fileLabel.file', 'file');
    qb.where('file.projectId = :projectId', { projectId });
    qb.andWhere('fileLabel.annotatorId = :annotatorId', { annotatorId });

    if (!includeDeleted) {
      qb.andWhere('fileLabel.deletedAt IS NULL');
      qb.andWhere('file.deletedAt IS NULL');
    }

    return await qb.getMany();
  }

  async FindProjectAnnotatorMetrics(
    projectId: string,
    em?: EntityManager,
  ): Promise<ProjectAnnotatorMetricsRow[]> {
    const repository = await this.GetRepository(em);

    return await repository
      .createQueryBuilder('fileLabel')
      .innerJoin('fileLabel.file', 'file')
      .innerJoin(
        ChecklistAnswerEntity,
        'checklist',
        'checklist.fileLabelId = fileLabel.id AND checklist.deletedAt IS NULL',
      )
      .innerJoin(
        ReviewEntity,
        'review',
        'review.checklistAnswerId = checklist.id AND review.deletedAt IS NULL',
      )
      .leftJoin(
        ReviewErrorEntity,
        'reviewError',
        'reviewError.reviewId = review.id AND reviewError.deletedAt IS NULL',
      )
      .leftJoin(
        ReviewErrorTypeEntity,
        'reviewErrorType',
        'reviewErrorType.id = reviewError.reviewErrorTypeId AND reviewErrorType.deletedAt IS NULL',
      )
      .select('fileLabel.annotatorId', 'annotatorId')
      .addSelect('COUNT(DISTINCT fileLabel.id)', 'totalFileLabeled')
      .addSelect('COUNT(DISTINCT reviewError.id)', 'errorCount')
      .addSelect(
        'COALESCE(SUM(reviewErrorType.scoreImpact), 0)',
        'totalPenalty',
      )
      .where('file.projectId = :projectId', { projectId })
      .andWhere('file.deletedAt IS NULL')
      .andWhere('fileLabel.deletedAt IS NULL')
      .groupBy('fileLabel.annotatorId')
      .getRawMany<ProjectAnnotatorMetricsRow>();
  }

  async FindProjectAnnotatorErrorBreakdown(
    projectId: string,
    em?: EntityManager,
  ): Promise<ProjectAnnotatorErrorBreakdownRow[]> {
    const repository = await this.GetRepository(em);

    return await repository
      .createQueryBuilder('fileLabel')
      .innerJoin('fileLabel.file', 'file')
      .innerJoin(
        ChecklistAnswerEntity,
        'checklist',
        'checklist.fileLabelId = fileLabel.id AND checklist.deletedAt IS NULL',
      )
      .innerJoin(
        ReviewEntity,
        'review',
        'review.checklistAnswerId = checklist.id AND review.deletedAt IS NULL',
      )
      .innerJoin(
        ReviewErrorEntity,
        'reviewError',
        'reviewError.reviewId = review.id AND reviewError.deletedAt IS NULL',
      )
      .innerJoin(
        ReviewErrorTypeEntity,
        'reviewErrorType',
        'reviewErrorType.id = reviewError.reviewErrorTypeId AND reviewErrorType.deletedAt IS NULL',
      )
      .select('fileLabel.annotatorId', 'annotatorId')
      .addSelect('reviewErrorType.id', 'errorTypeId')
      .addSelect('reviewErrorType.name', 'name')
      .addSelect('reviewErrorType.description', 'description')
      .addSelect('reviewErrorType.severity', 'severity')
      .addSelect('reviewErrorType.scoreImpact', 'scoreImpact')
      .addSelect('COUNT(reviewError.id)', 'count')
      .addSelect('COALESCE(SUM(reviewErrorType.scoreImpact), 0)', 'totalImpact')
      .where('file.projectId = :projectId', { projectId })
      .andWhere('file.deletedAt IS NULL')
      .andWhere('fileLabel.deletedAt IS NULL')
      .groupBy('fileLabel.annotatorId')
      .addGroupBy('reviewErrorType.id')
      .addGroupBy('reviewErrorType.name')
      .addGroupBy('reviewErrorType.description')
      .addGroupBy('reviewErrorType.severity')
      .addGroupBy('reviewErrorType.scoreImpact')
      .getRawMany<ProjectAnnotatorErrorBreakdownRow>();
  }

  async FindAccountRatingMetrics(
    projectId: string,
    accountId: string,
    em?: EntityManager,
  ): Promise<AccountRatingMetricsRow | undefined> {
    const repository = await this.GetRepository(em);

    return await repository
      .createQueryBuilder('fileLabel')
      .innerJoin('fileLabel.file', 'file')
      .leftJoin(
        ReviewEntity,
        'review',
        'review.fileLabelId = fileLabel.id AND review.deletedAt IS NULL',
      )
      .leftJoin(
        ReviewErrorEntity,
        'reviewError',
        'reviewError.reviewId = review.id AND reviewError.deletedAt IS NULL',
      )
      .leftJoin(
        ReviewErrorTypeEntity,
        'reviewErrorType',
        'reviewErrorType.id = reviewError.reviewErrorTypeId AND reviewErrorType.deletedAt IS NULL',
      )
      .select('COUNT(DISTINCT fileLabel.id)', 'totalFileLabeled')
      .addSelect('COUNT(DISTINCT reviewError.id)', 'errorCount')
      .addSelect(
        'COALESCE(SUM(reviewErrorType.scoreImpact), 0)',
        'totalPenalty',
      )
      .where('file.projectId = :projectId', { projectId })
      .andWhere('file.deletedAt IS NULL')
      .andWhere('fileLabel.deletedAt IS NULL')
      .andWhere('fileLabel.annotatorId = :accountId', { accountId })
      .getRawOne<AccountRatingMetricsRow>();
  }

  async FindAccountRatingErrorBreakdown(
    projectId: string,
    accountId: string,
    em?: EntityManager,
  ): Promise<AccountRatingErrorBreakdownRow[]> {
    const repository = await this.GetRepository(em);

    return await repository
      .createQueryBuilder('fileLabel')
      .innerJoin('fileLabel.file', 'file')
      .leftJoin(
        ReviewEntity,
        'review',
        'review.fileLabelId = fileLabel.id AND review.deletedAt IS NULL',
      )
      .innerJoin(
        ReviewErrorEntity,
        'reviewError',
        'reviewError.reviewId = review.id AND reviewError.deletedAt IS NULL',
      )
      .innerJoin(
        ReviewErrorTypeEntity,
        'reviewErrorType',
        'reviewErrorType.id = reviewError.reviewErrorTypeId AND reviewErrorType.deletedAt IS NULL',
      )
      .select('reviewErrorType.id', 'errorTypeId')
      .addSelect('reviewErrorType.name', 'name')
      .addSelect('reviewErrorType.description', 'description')
      .addSelect('reviewErrorType.severity', 'severity')
      .addSelect('reviewErrorType.scoreImpact', 'scoreImpact')
      .addSelect('COUNT(reviewError.id)', 'count')
      .addSelect('COALESCE(SUM(reviewErrorType.scoreImpact), 0)', 'totalImpact')
      .where('file.projectId = :projectId', { projectId })
      .andWhere('file.deletedAt IS NULL')
      .andWhere('fileLabel.deletedAt IS NULL')
      .andWhere('fileLabel.annotatorId = :accountId', { accountId })
      .groupBy('reviewErrorType.id')
      .addGroupBy('reviewErrorType.name')
      .addGroupBy('reviewErrorType.description')
      .addGroupBy('reviewErrorType.severity')
      .addGroupBy('reviewErrorType.scoreImpact')
      .getRawMany<AccountRatingErrorBreakdownRow>();
  }
}
