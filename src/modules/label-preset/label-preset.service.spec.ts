import { Test, TestingModule } from '@nestjs/testing';
import { LabelPresetService } from './label-preset.service';

describe('LabelPresetService', () => {
  let service: LabelPresetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LabelPresetService],
    }).compile();

    service = module.get<LabelPresetService>(LabelPresetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
