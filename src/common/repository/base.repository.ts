import { ObjectLiteral, Repository } from 'typeorm';
import { EntityManager } from 'typeorm/entity-manager/EntityManager';

/**
 * Base repository class providing common transaction handling methods.
 * All entity-specific repositories should extend this class.
 *
 * @template T - The entity type this repository manages
 */
export abstract class BaseRepository<T extends ObjectLiteral = ObjectLiteral> {
  protected constructor(
    protected readonly repository: Repository<T>,
    protected readonly entityClass: new () => T,
  ) {}

  /**
   * Get the entity manager from the repository.
   * Useful for starting transactions.
   */
  async GetEntityManager(): Promise<EntityManager> {
    return this.repository.manager;
  }

  /**
   * Get the repository instance, either from a transactional entity manager
   * or the default injected repository.
   *
   * @param entityManager - Optional transactional entity manager
   * @returns Repository instance for the entity
   */
  async GetRepository(entityManager?: EntityManager): Promise<Repository<T>> {
    if (entityManager) {
      return entityManager.getRepository(this.entityClass);
    }

    return this.repository;
  }
}
