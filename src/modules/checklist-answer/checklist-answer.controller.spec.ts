import { Test, TestingModule } from '@nestjs/testing';
import { ChecklistAnswerController } from './checklist-answer.controller';

describe('ChecklistAnswerController', () => {
  let controller: ChecklistAnswerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChecklistAnswerController],
    }).compile();

    controller = module.get<ChecklistAnswerController>(ChecklistAnswerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
