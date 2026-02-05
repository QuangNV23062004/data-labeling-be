import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/base.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { FileEntity } from './file.entity';
import { FilterFileQueryDto } from './dtos/filter-file-query.dto';
import { PaginationResultDto } from 'src/common/pagination/pagination-result.dto';
@Injectable()
export class FileRepository extends BaseRepository<FileEntity> {
  constructor(
    @InjectRepository(FileEntity)
    repository: Repository<FileEntity>,
  ) {
    super(repository, FileEntity);
  }

  async FindAll(
    query: FilterFileQueryDto,
    includeDeleted: boolean,
    em?: EntityManager,
  ) {
    const repository = await this.GetRepository(em);
    const qb = repository.createQueryBuilder('file');

    if (query?.search && query?.searchBy) {
      qb.andWhere(`file.${query.searchBy} ILIKE unaccent(:search)`, {
        search: `%${query.search}%`,
      });
    }

    if (query?.order && query?.orderBy) {
      qb.orderBy(
        `file.${query.orderBy}`,
        query.order.toUpperCase() as 'ASC' | 'DESC',
      );
    }

    if (query?.projectId) {
      qb.andWhere(`file.projectId = :projectId`, {
        projectId: query.projectId,
      });
    }

    if (query?.uploadedById) {
      qb.andWhere(`file.uploadedById = :uploadedById`, {
        uploadedById: query.uploadedById,
      });
    }

    if (query?.taskId) {
      qb.andWhere(`file.taskId = :taskId`, {
        taskId: query.taskId,
      });
    }

    if (query?.contentType) {
      qb.andWhere(`file.contentType = :contentType`, {
        contentType: query.contentType,
      });
    }

    if (!includeDeleted) {
      qb.andWhere(`file.deletedAt IS NULL`);
      qb.leftJoinAndSelect(
        'file.project',
        'project',
        'project.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'file.uploadedBy',
        'uploadedBy',
        'uploadedBy.deletedAt IS NULL',
      );

      qb.leftJoinAndSelect(
        'file.fileLabels',
        'fileLabels',
        'fileLabels.deletedAt IS NULL',
      );
    } else {
      qb.leftJoinAndSelect('file.project', 'project');
      qb.leftJoinAndSelect('file.uploadedBy', 'uploadedBy');

      qb.leftJoinAndSelect('file.fileLabels', 'fileLabels');
    }

    return await qb.getMany();
  }

  async FindPaginated(
    query: FilterFileQueryDto,
    includeDeleted: boolean,
    em?: EntityManager,
  ): Promise<PaginationResultDto<FileEntity>> {
    const repository = await this.GetRepository(em);
    const qb = repository.createQueryBuilder('file');

    if (query?.search && query?.searchBy) {
      qb.andWhere(`file.${query.searchBy} ILIKE unaccent(:search)`, {
        search: `%${query.search}%`,
      });
    }

    if (query?.order && query?.orderBy) {
      qb.orderBy(
        `file.${query.orderBy}`,
        query.order.toUpperCase() as 'ASC' | 'DESC',
      );
    }

    if (query?.projectId) {
      qb.andWhere(`file.projectId = :projectId`, {
        projectId: query.projectId,
      });
    }

    if (query?.uploadedById) {
      qb.andWhere(`file.uploadedById = :uploadedById`, {
        uploadedById: query.uploadedById,
      });
    }

    if (query?.taskId) {
      qb.andWhere(`file.taskId = :taskId`, {
        taskId: query.taskId,
      });
    }

    if (query?.contentType) {
      qb.andWhere(`file.contentType = :contentType`, {
        contentType: query.contentType,
      });
    }

    if (!includeDeleted) {
      qb.andWhere(`file.deletedAt IS NULL`);
      qb.leftJoinAndSelect(
        'file.project',
        'project',
        'project.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'file.uploadedBy',
        'uploadedBy',
        'uploadedBy.deletedAt IS NULL',
      );

      qb.leftJoinAndSelect(
        'file.fileLabels',
        'fileLabels',
        'fileLabels.deletedAt IS NULL',
      );
    } else {
      qb.leftJoinAndSelect('file.project', 'project');
      qb.leftJoinAndSelect('file.uploadedBy', 'uploadedBy');

      qb.leftJoinAndSelect('file.fileLabels', 'fileLabels');
    }

    const total = await qb.getCount();

    const safePage = query?.page ?? 1;
    const safeLimit = query?.limit ?? 10;
    const offset = (safePage - 1) * safeLimit;
    const items = await qb.skip(offset).take(safeLimit).getMany();

    const totalPage = Math.ceil(total / safeLimit);
    return new PaginationResultDto<FileEntity>(
      items,
      totalPage,
      safePage,
      safeLimit,
      query?.search || '',
      query?.searchBy || 'fileName',
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
  ): Promise<FileEntity | null> {
    const repository = await this.GetRepository(em);
    const qb = repository.createQueryBuilder('file');

    qb.where('file.id = :id', { id });

    if (!includeDeleted) {
      qb.andWhere(`file.deletedAt IS NULL`);
      qb.leftJoinAndSelect(
        'file.project',
        'project',
        'project.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'file.uploadedBy',
        'uploadedBy',
        'uploadedBy.deletedAt IS NULL',
      );

      qb.leftJoinAndSelect(
        'file.fileLabels',
        'fileLabels',
        'fileLabels.deletedAt IS NULL',
      );
    } else {
      qb.leftJoinAndSelect('file.project', 'project');
      qb.leftJoinAndSelect('file.uploadedBy', 'uploadedBy');
      qb.leftJoinAndSelect('file.fileLabels', 'fileLabels');
    }

    return await qb.getOne();
  }

  async FindByIds(
    ids: string[],
    includeDeleted: boolean,
    em?: EntityManager,
  ): Promise<FileEntity[]> {
    const repository = await this.GetRepository(em);
    const qb = repository.createQueryBuilder('file');

    qb.where('file.id IN (:...ids)', { ids });

    if (!includeDeleted) {
      qb.andWhere(`file.deletedAt IS NULL`);
      qb.leftJoinAndSelect(
        'file.project',
        'project',
        'project.deletedAt IS NULL',
      );
      qb.leftJoinAndSelect(
        'file.uploadedBy',
        'uploadedBy',
        'uploadedBy.deletedAt IS NULL',
      );

      qb.leftJoinAndSelect(
        'file.fileLabels',
        'fileLabels',
        'fileLabels.deletedAt IS NULL',
      );
    } else {
      qb.leftJoinAndSelect('file.project', 'project');
      qb.leftJoinAndSelect('file.uploadedBy', 'uploadedBy');
      qb.leftJoinAndSelect('file.fileLabels', 'fileLabels');
    }

    return await qb.getMany();
  }

  async Create(data: FileEntity, em?: EntityManager): Promise<FileEntity> {
    const repository = await this.GetRepository(em);
    return await repository.save(data);
  }

  async Update(data: FileEntity, em?: EntityManager): Promise<FileEntity> {
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

  //use when assign task, probably
  async BatchUpdate(
    ids: string[],
    data: Partial<FileEntity>,
    em?: EntityManager,
  ): Promise<boolean> {
    const repository = await this.GetRepository(em);
    const result = await repository.update(ids, data);
    return result?.affected !== undefined && result?.affected > 0;
  }
}
