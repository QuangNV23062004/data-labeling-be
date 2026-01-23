import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { TypedConfigModule } from '../typed-config/typed-config.module';

@Module({
  imports: [TypedConfigModule],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
