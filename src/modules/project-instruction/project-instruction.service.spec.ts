import { Test, TestingModule } from '@nestjs/testing';
import { ProjectInstructionService } from './project-instruction.service';

describe('ProjectInstructionService', () => {
  let service: ProjectInstructionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectInstructionService],
    }).compile();

    service = module.get<ProjectInstructionService>(ProjectInstructionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
