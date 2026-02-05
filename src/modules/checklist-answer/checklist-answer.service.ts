import { Injectable } from '@nestjs/common';
import { ChecklistAnswerRepository } from './checklist-answer.repository';
import { BaseService } from 'src/common/service/base.service';
import { CreateChecklistAnswerDto } from './dtos/create-checklist-answer.dto';
import { ChecklistAnswerEntity } from './checklist-answer.entity';
import { UpdateChecklistAnswerDto } from './dtos/update-checklist-answer.dto';
import { ChecklistAnswerNotFoundException } from './exceptions/checklist-answer-exceptions.exception';
import { AccountInfo } from 'src/interfaces/request';

@Injectable()
export class ChecklistAnswerService extends BaseService {
  constructor(
    private readonly checklistAnswerRepository: ChecklistAnswerRepository,
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

      // TODO: validate file label, questionIds in data, handle labelAttemptNumber, need to provide all questionIds for file label, add accountInfo
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
      const entity = await this.checklistAnswerRepository.FindById(
        id,
        false,
        transactionalEntityManager,
      );

      if (!entity) {
        throw new ChecklistAnswerNotFoundException(id);
      }
      //TODO: validate file label, questionIds in data, block update if there are new attempt after: Eg: annotator cant update if reviewer created, reviewer attempt1 cant update if annotator created attempt2
      const updatedEntity: ChecklistAnswerEntity = Object.assign(entity, {
        ...updateDto,
      });
      return this.checklistAnswerRepository.Update(
        updatedEntity,
        transactionalEntityManager,
      );
    });
  }

  async SoftDelete(id: string): Promise<void> {
    const em = await this.checklistAnswerRepository.GetEntityManager();
    return await em.transaction(async (transactionalEntityManager) => {
      const entity = await this.checklistAnswerRepository.FindById(
        id,
        false,
        transactionalEntityManager,
      );

      if (!entity) {
        throw new ChecklistAnswerNotFoundException(id);
      }

      //TODO: can't delete if there are attempts after: Eg: annotator cant delete if reviewer created, reviewer attempt1 cant delete if annotator created attempt2
      await this.checklistAnswerRepository.SoftDelete(
        id,
        transactionalEntityManager,
      );
    });
  }

  async Restore(id: string): Promise<void> {
    const em = await this.checklistAnswerRepository.GetEntityManager();
    return await em.transaction(async (transactionalEntityManager) => {
      const entity = await this.checklistAnswerRepository.FindById(
        id,
        true,
        transactionalEntityManager,
      );
      if (!entity) {
        throw new ChecklistAnswerNotFoundException(id);
      }

      //TODO: check label reference exist and not deleted
      await this.checklistAnswerRepository.Restore(
        id,
        transactionalEntityManager,
      );
    });
  }

  async HardDelete(id: string): Promise<void> {
    const em = await this.checklistAnswerRepository.GetEntityManager();
    return await em.transaction(async (transactionalEntityManager) => {
      const entity = await this.checklistAnswerRepository.FindById(
        id,
        true,
        transactionalEntityManager,
      );

      if (!entity) {
        throw new ChecklistAnswerNotFoundException(id);
      }

      //TODO: can't delete if there are attempts after: Eg: annotator cant delete if reviewer created, reviewer attempt1 cant delete if annotator created attempt2
      await this.checklistAnswerRepository.HardDelete(
        id,
        transactionalEntityManager,
      );
    });
  }
}
