import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ShadowPrismaService } from './prisma/shadow-prisma.service';
import { ArchiveTask } from './prisma/archive.task';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    ScheduleModule.forRoot(), // <-- Add this
  ],
  controllers: [AppController],
  providers: [AppService, ArchiveTask, ShadowPrismaService], // <-- Add ArchiveTask & ShadowPrismaService
})
export class AppModule {}
