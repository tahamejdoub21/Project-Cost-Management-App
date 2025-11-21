// src/tasks/archive.task.ts
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { ShadowPrismaService } from '../prisma/shadow-prisma.service';
import { archiveDeletedUsers } from '../prisma/archive.util';

@Injectable()
export class ArchiveTask {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shadowPrisma: ShadowPrismaService,
  ) {}

  @Cron('0 0 * * *') // Every day at midnight
  async handleCron() {
    console.log('🕒 Running daily archive job...');
    await archiveDeletedUsers(this.prisma, this.shadowPrisma);
  }
}
