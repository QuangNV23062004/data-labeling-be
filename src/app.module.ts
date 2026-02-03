import { HttpStatus, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { TypedConfigModule } from './common/typed-config/typed-config.module';
import { TypedConfigService } from './common/typed-config/typed-config.service';
import { AccountModule } from './modules/account/account.module';
import { AuthModule } from './modules/auth/auth.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/role.guard';
import {
  ResponseTransformInterceptor,
  LoggingInterceptor,
  TimeoutInterceptor,
} from './interceptors';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { HttpExceptionFilter } from './filters';
import { DatabaseModule } from './common/database/database.module';
import { ResetPasswordTokenModule } from './modules/reset-password-token/reset-password-token.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ErrorLogsModule } from './modules/error-logs/error-logs.module';
import { ErrorLoggingInterceptor } from './interceptors/error-logging.interceptor';
import { ErrorLogRepository } from './modules/error-logs/error-logs.repository';
import { AccountRepository } from './modules/account/account.repository';
import { StorageModule } from './common/storage/storage.module';
import { LabelCategoryModule } from './modules/label-category/label-category.module';
import { LabelModule } from './modules/label/label.module';
import { LabelPresetModule } from './modules/label-preset/label-preset.module';
import { LabelChecklistQuestionModule } from './modules/label-checklist-question/label-checklist-question.module';
import { ProjectModule } from './modules/project/project.module';
import { ProjectConfigurationModule } from './modules/project-configuration/project-configuration.module';
import { ProjectInstructionModule } from './modules/project-instruction/project-instruction.module';
import { FileModule } from './modules/file/file.module';
import { FileLabelModule } from './modules/file-label/file-label.module';
import { ProjectTaskModule } from './modules/project-task/project-task.module';
import { ReviewModule } from './modules/review/review.module';
import { ReviewErrorModule } from './modules/review-error/review-error.module';
import { ReviewErrorTypeModule } from './modules/review-error-type/review-error-type.module';
import { NotificationModule } from './modules/notification/notification.module';
import { DatasetModule } from './modules/dataset/dataset.module';
import { ProjectSnapshotModule } from './modules/project-snapshot/project-snapshot.module';
import { AccountRatingModule } from './modules/account-rating/account-rating.module';
import { AccountRatingHistoryModule } from './modules/account-rating-history/account-rating-history.module';

@Module({
  imports: [
    //config module
    TypedConfigModule,
    JwtModule,
    MailerModule.forRootAsync({
      inject: [TypedConfigService],
      useFactory: (configService: TypedConfigService) => ({
        transport: {
          host: configService.email.host,
          port: configService.email.port,
          secure: false, // true for 465, false for other ports
          auth: {
            user: configService.email.user,
            pass: configService.email.pass,
          },
        },
        defaults: {
          from: '"No Reply" <noreply@example.com>',
        },
        template: {
          dir: process.cwd() + '/src/modules/auth/templates',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),

    StorageModule,
    ScheduleModule.forRoot(),
    //db module
    DatabaseModule.forRoot(),

    //modules
    AccountModule,
    AuthModule,
    ErrorLogsModule,
    ResetPasswordTokenModule,
    LabelCategoryModule,
    LabelModule,
    LabelPresetModule,
    LabelChecklistQuestionModule,
    ProjectModule,
    ProjectConfigurationModule,
    ProjectInstructionModule,
    FileModule,
    FileLabelModule,
    ProjectTaskModule,
    ReviewModule,
    ReviewErrorModule,
    ReviewErrorTypeModule,
    NotificationModule,
    DatasetModule,
    ProjectSnapshotModule,
    AccountRatingModule,
    AccountRatingHistoryModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    TypedConfigService,
    JwtService,

    // Exception Filters
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // Guards
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // Interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformInterceptor,
    },
    // Fix: Use useFactory to pass dependencies (ErrorLogRepository and the array of statuses)
    {
      provide: APP_INTERCEPTOR,
      useFactory: (errorLogRepo: ErrorLogRepository) =>
        new ErrorLoggingInterceptor(errorLogRepo, [
          HttpStatus.UNAUTHORIZED,
          HttpStatus.FORBIDDEN,
          HttpStatus.INTERNAL_SERVER_ERROR,
        ]), // Configurable statuses
      inject: [ErrorLogRepository],
    },
    {
      provide: APP_INTERCEPTOR,
      useFactory: () => new TimeoutInterceptor(30000),
    },
  ],
})
export class AppModule {}
