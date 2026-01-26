import { Test, TestingModule } from '@nestjs/testing';
import { ProjectSnapshotController } from './project-snapshot.controller';

describe('ProjectSnapshotController', () => {
  let controller: ProjectSnapshotController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectSnapshotController],
    }).compile();

    controller = module.get<ProjectSnapshotController>(ProjectSnapshotController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
