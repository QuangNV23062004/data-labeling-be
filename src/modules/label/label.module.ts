import { Module } from '@nestjs/common';
import { LabelService } from './label.service';
import { LabelController } from './label.controller';
import { LabelCategoryModule } from '../label-category/label-category.module';
import { LabelRepository } from './label.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabelEntity } from './label.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LabelEntity]), LabelCategoryModule],
  providers: [LabelService, LabelRepository],
  controllers: [LabelController],
  exports: [LabelService, LabelRepository],
})
export class LabelModule {}
