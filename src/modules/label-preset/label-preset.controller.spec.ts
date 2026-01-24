import { Test, TestingModule } from '@nestjs/testing';
import { LabelPresetController } from './label-preset.controller';

describe('LabelPresetController', () => {
  let controller: LabelPresetController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LabelPresetController],
    }).compile();

    controller = module.get<LabelPresetController>(LabelPresetController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
