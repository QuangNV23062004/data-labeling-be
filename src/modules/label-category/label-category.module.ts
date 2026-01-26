import { Module } from '@nestjs/common';
import { LabelCategoryController } from './label-category.controller';
import { LabelCategoryService } from './label-category.service';
import { LabelCategoryRepository } from './label-category.repository';
import { LabelCategoryEntity } from './label-category.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([LabelCategoryEntity])],
  controllers: [LabelCategoryController],
  providers: [LabelCategoryService, LabelCategoryRepository],
  exports: [LabelCategoryService, LabelCategoryRepository],
})
export class LabelCategoryModule {}
