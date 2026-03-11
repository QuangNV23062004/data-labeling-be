import { Test, TestingModule } from '@nestjs/testing';
import { DatasetController } from './dataset.controller';
import { DatasetService } from './dataset.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/role.guard';

const mockDatasetService: Partial<DatasetService> = {
  InitiateExport: jest.fn(),
  GetExportStatus: jest.fn(),
  DownloadExport: jest.fn(),
  DeleteExport: jest.fn(),
  ClearAllExports: jest.fn(),
};

describe('DatasetController', () => {
  let controller: DatasetController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DatasetController],
      providers: [
        { provide: DatasetService, useValue: mockDatasetService },
      ],
    })
      .overrideGuard(AuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get<DatasetController>(DatasetController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
