import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatasetController } from './dataset.controller';
import { DatasetService } from './dataset.service';
import { DatasetRepository } from './dataset.repository';
import { DatasetEntity } from './dataset.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DatasetEntity])],
  controllers: [DatasetController],
  providers: [DatasetService, DatasetRepository],
})
export class DatasetModule {}
