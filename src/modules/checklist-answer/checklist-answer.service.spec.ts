import { Test, TestingModule } from '@nestjs/testing';
import { ChecklistAnswerService } from './checklist-answer.service';

describe('ChecklistAnswerService', () => {
  let service: ChecklistAnswerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChecklistAnswerService],
    }).compile();

    service = module.get<ChecklistAnswerService>(ChecklistAnswerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
