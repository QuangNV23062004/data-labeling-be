import { Test, TestingModule } from '@nestjs/testing';
import { FileLabelController } from './file-label.controller';

describe('FileLabelController', () => {
  let controller: FileLabelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileLabelController],
    }).compile();

    controller = module.get<FileLabelController>(FileLabelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
