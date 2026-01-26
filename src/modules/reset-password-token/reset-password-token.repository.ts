import { InjectRepository } from '@nestjs/typeorm';
import {
  Condition,
  FindOptionsWhere,
  LessThanOrEqual,
  Repository,
  IsNull,
} from 'typeorm';
import { ResetPasswordTokenEntity } from './reset-password-token.entity';
import { EntityManager } from 'typeorm';
import {
  WhereClause,
  WhereClauseCondition,
} from 'typeorm/query-builder/WhereClause';
import { BaseRepository } from 'src/common/repository/base.repository';

export class ResetPasswordTokenRepository extends BaseRepository<ResetPasswordTokenEntity> {
  constructor(
    @InjectRepository(ResetPasswordTokenEntity)
    repository: Repository<ResetPasswordTokenEntity>,
  ) {
    super(repository, ResetPasswordTokenEntity);
  }

  async Create(
    token: ResetPasswordTokenEntity,
    entityManager?: EntityManager,
  ): Promise<ResetPasswordTokenEntity> {
    const repository = await this.GetRepository(entityManager);

    return repository.save(token);
  }

  async FindById(
    id: string,
    includeDeleted: boolean,
    entityManager?: EntityManager,
  ): Promise<ResetPasswordTokenEntity | null> {
    const repository = await this.GetRepository(entityManager);
    const where: any = { id: id };
    if (includeDeleted) {
      return repository.findOne({ where: where });
    }
    return repository.findOne({ where: { ...where, deletedAt: IsNull() } });
  }

  async SoftDelete(
    id: string,
    entityManager?: EntityManager,
  ): Promise<boolean> {
    const repository = await this.GetRepository(entityManager);
    const result = await repository.update(id, { deletedAt: new Date() });
    return (result?.affected as number) > 0;
  }

  async HardDelete(
    id: string,
    entityManager?: EntityManager,
  ): Promise<boolean> {
    const repository = await this.GetRepository(entityManager);
    const result = await repository.delete(id);
    return (result?.affected as number) > 0;
  }

  async Restore(id: string, entityManager?: EntityManager): Promise<void> {
    const repository = await this.GetRepository(entityManager);
    await repository.update(id, { deletedAt: null });
  }

  async Update(
    token: ResetPasswordTokenEntity,
    entityManager?: EntityManager,
  ): Promise<ResetPasswordTokenEntity> {
    const repository = await this.GetRepository(entityManager);
    return repository.save(token);
  }

  async BatchUpdate(
    where: FindOptionsWhere<ResetPasswordTokenEntity>,
    updateData: Partial<ResetPasswordTokenEntity>,
    entityManager?: EntityManager,
  ): Promise<void> {
    const repository = await this.GetRepository(entityManager);
    await repository.update(where, updateData);
  }

  async DeleteExpiredTokens(entityManager?: EntityManager): Promise<number> {
    const repository = await this.GetRepository(entityManager);
    const result = await repository.delete({
      expiresAt: LessThanOrEqual(new Date()),
      deletedAt: IsNull(),
    });
    return (result?.affected as number) || 0;
  }

  async FindActiveTokenByAccountId(
    accountId: string,
    entityManager?: EntityManager,
  ): Promise<ResetPasswordTokenEntity | null> {
    const repository = await this.GetRepository(entityManager);
    return repository.findOne({
      where: {
        accountId: accountId,
        usable: true,
        deletedAt: IsNull(),
      },
    });
  }
}
