import { Test, TestingModule } from '@nestjs/testing';
import { DatasetService } from './dataset.service';
import { ProjectSnapshotRepository } from '../project-snapshot/project-snapshot.repository';
import { StorageService } from 'src/common/storage/storage.service';

const mockProjectSnapshotRepository: Partial<ProjectSnapshotRepository> = {
  FindById: jest.fn()
};

const mockStorageService: Partial<StorageService> = {
  DownloadBlobByUrl: jest.fn(),
  CreateZip: jest.fn(),
};

describe('DatasetService', () => {
  let service: DatasetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatasetService,
        { provide: ProjectSnapshotRepository, useValue: mockProjectSnapshotRepository },
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compile();

    service = module.get<DatasetService>(DatasetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
