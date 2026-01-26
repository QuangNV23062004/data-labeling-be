import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationRepository } from './notification.repository';
import { NotificationEntity } from './notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationEntity])],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationRepository],
})
export class NotificationModule {}
