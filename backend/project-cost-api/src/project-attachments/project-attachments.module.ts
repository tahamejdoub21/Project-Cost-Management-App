import { Module } from '@nestjs/common';
import { ProjectAttachmentsService } from './project-attachments.service';
import { ProjectAttachmentsController } from './project-attachments.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProjectAttachmentsController],
  providers: [ProjectAttachmentsService],
  exports: [ProjectAttachmentsService],
})
export class ProjectAttachmentsModule {}
