import { Test, TestingModule } from '@nestjs/testing';
import { LabelChecklistQuestionController } from './label-checklist-question.controller';

describe('LabelChecklistQuestionController', () => {
  let controller: LabelChecklistQuestionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LabelChecklistQuestionController],
    }).compile();

    controller = module.get<LabelChecklistQuestionController>(LabelChecklistQuestionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
