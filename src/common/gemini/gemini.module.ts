import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { TypedConfigModule } from '../typed-config/typed-config.module';

@Module({
  imports: [TypedConfigModule],
  providers: [GeminiService],
  exports: [GeminiService],
})
export class GeminiModule {}
