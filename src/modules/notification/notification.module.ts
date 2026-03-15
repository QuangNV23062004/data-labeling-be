import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationRepository } from './notification.repository';
import { NotificationEntity } from './notification.entity';
import { NotificationGateway } from './notification.gateway';
import { AuthModule } from '../auth/auth.module';
import { AccountModule } from '../account/account.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationEntity]),
    AuthModule,
    AccountModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationRepository, NotificationGateway],
  exports: [NotificationService, NotificationGateway],
})
export class NotificationModule {}
