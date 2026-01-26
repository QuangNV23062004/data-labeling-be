import { Test, TestingModule } from '@nestjs/testing';
import { ProjectConfigurationService } from './project-configuration.service';

describe('ProjectConfigurationService', () => {
  let service: ProjectConfigurationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectConfigurationService],
    }).compile();

    service = module.get<ProjectConfigurationService>(ProjectConfigurationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
