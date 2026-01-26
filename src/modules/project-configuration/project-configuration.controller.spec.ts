import { Test, TestingModule } from '@nestjs/testing';
import { ProjectConfigurationController } from './project-configuration.controller';

describe('ProjectConfigurationController', () => {
  let controller: ProjectConfigurationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectConfigurationController],
    }).compile();

    controller = module.get<ProjectConfigurationController>(ProjectConfigurationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
