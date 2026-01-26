import { Test, TestingModule } from '@nestjs/testing';
import { ProjectSnapshotService } from './project-snapshot.service';

describe('ProjectSnapshotService', () => {
  let service: ProjectSnapshotService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectSnapshotService],
    }).compile();

    service = module.get<ProjectSnapshotService>(ProjectSnapshotService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
