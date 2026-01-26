import { Test, TestingModule } from '@nestjs/testing';
import { LabelChecklistQuestionAnswerController } from './label-checklist-question-answer.controller';

describe('LabelChecklistQuestionAnswerController', () => {
  let controller: LabelChecklistQuestionAnswerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LabelChecklistQuestionAnswerController],
    }).compile();

    controller = module.get<LabelChecklistQuestionAnswerController>(LabelChecklistQuestionAnswerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
