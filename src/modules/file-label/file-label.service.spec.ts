import { Test, TestingModule } from '@nestjs/testing';
import { FileLabelService } from './file-label.service';

describe('FileLabelService', () => {
  let service: FileLabelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileLabelService],
    }).compile();

    service = module.get<FileLabelService>(FileLabelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
