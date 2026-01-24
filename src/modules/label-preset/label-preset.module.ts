import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabelPresetController } from './label-preset.controller';
import { LabelPresetService } from './label-preset.service';
import { LabelPresetEntity } from './label-preset.entity';
import { LabelPresetRepository } from './label-preset.repository';
import { LabelModule } from '../label/label.module';

@Module({
  imports: [TypeOrmModule.forFeature([LabelPresetEntity]), LabelModule],
  controllers: [LabelPresetController],
  providers: [LabelPresetService, LabelPresetRepository],
})
export class LabelPresetModule {}
