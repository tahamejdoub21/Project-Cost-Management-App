import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ProjectAttachmentsService } from './project-attachments.service';
import { CreateProjectAttachmentDto } from './dto/create-project-attachment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('project-attachments')
@UseGuards(JwtAuthGuard)
export class ProjectAttachmentsController {
  constructor(
    private readonly projectAttachmentsService: ProjectAttachmentsService,
  ) {}

  @Post()
  create(
    @CurrentUser('id') userId: string,
    @Body() createDto: CreateProjectAttachmentDto,
  ) {
    return this.projectAttachmentsService.create(userId, createDto);
  }

  @Get('project/:projectId')
  findByProject(
    @Param('projectId') projectId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectAttachmentsService.findByProject(projectId, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.projectAttachmentsService.remove(id, userId);
  }
}
