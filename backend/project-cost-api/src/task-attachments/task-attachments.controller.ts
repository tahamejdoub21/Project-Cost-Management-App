import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TaskAttachmentsService } from './task-attachments.service';
import { CreateTaskAttachmentDto } from './dto/create-task-attachment.dto';
import { UpdateTaskAttachmentDto } from './dto/update-task-attachment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('task-attachments')
@UseGuards(JwtAuthGuard)
export class TaskAttachmentsController {
  constructor(
    private readonly taskAttachmentsService: TaskAttachmentsService,
  ) {}

  @Post()
  create(
    @CurrentUser('id') userId: string,
    @Body() createDto: CreateTaskAttachmentDto,
  ) {
    return this.taskAttachmentsService.create(userId, createDto);
  }

  @Get('task/:taskId')
  findByTask(
    @Param('taskId') taskId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.taskAttachmentsService.findByTask(taskId, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.taskAttachmentsService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateDto: UpdateTaskAttachmentDto,
  ) {
    return this.taskAttachmentsService.update(id, userId, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.taskAttachmentsService.remove(id, userId);
  }
}
