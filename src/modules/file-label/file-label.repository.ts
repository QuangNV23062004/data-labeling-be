import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, Repository } from 'typeorm';
import { FileLabelEntity } from './file-label.entity';
import { FilterFileLabelQueryDto } from './dtos/filter-file-label-query.dto';
import { PaginationResultDto } from 'src/common/pagination/pagination-result.dto';

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

    return await qb.getMany();
  }

  async FindPaginated(
    query: FilterFileLabelQueryDto,
    includeDeleted: boolean,
    em?: EntityManager,
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
}
