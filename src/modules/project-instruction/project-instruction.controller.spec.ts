import { Test, TestingModule } from '@nestjs/testing';
import { ProjectInstructionController } from './project-instruction.controller';

describe('ProjectInstructionController', () => {
  let controller: ProjectInstructionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectInstructionController],
    }).compile();

    controller = module.get<ProjectInstructionController>(ProjectInstructionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
