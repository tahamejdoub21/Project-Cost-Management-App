import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ArchiveTask } from './prisma/archive.task';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { UploadModule } from './uploads/upload.module';
import { MailModule } from './mail/mail.module';
import { ProjectsModule } from './projects/projects.module';
import { StatisticsModule } from './statistics/statistics.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { TasksModule } from './tasks/tasks.module';
import { TimeEntriesModule } from './time-entries/time-entries.module';
import { TaskCommentsModule } from './task-comments/task-comments.module';
import { TaskAttachmentsModule } from './task-attachments/task-attachments.module';
import { DiscussionsModule } from './discussions/discussions.module';
import { NotificationsModule } from './notifications/notifications.module';
import { TeamRatingsModule } from './team-ratings/team-ratings.module';
import { CostCategoriesModule } from './cost-categories/cost-categories.module';
import { CostsModule } from './costs/costs.module';
import { CostTemplatesModule } from './cost-templates/cost-templates.module';
import { ProjectAttachmentsModule } from './project-attachments/project-attachments.module';
import { UserProfilesModule } from './user-profiles/user-profiles.module';
import { UserSettingsModule } from './user-settings/user-settings.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { WebSocketModule } from './websocket/websocket.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    ScheduleModule.forRoot(),
    MailModule,
    AuthModule,
    UsersModule,
    UploadModule,
    ProjectsModule,
    StatisticsModule,
    TasksModule,
    TimeEntriesModule,
    TaskCommentsModule,
    TaskAttachmentsModule,
    DiscussionsModule,
    NotificationsModule,
    TeamRatingsModule,
    CostCategoriesModule,
    CostsModule,
    CostTemplatesModule,
    ProjectAttachmentsModule,
    UserProfilesModule,
    UserSettingsModule,
    AuditLogsModule,
    WebSocketModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ArchiveTask,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
