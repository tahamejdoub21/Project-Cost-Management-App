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
import { DiscussionsService } from './discussions.service';
import { CreateDiscussionDto } from './dto/create-discussion.dto';
import { UpdateDiscussionDto } from './dto/update-discussion.dto';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('discussions')
@UseGuards(JwtAuthGuard)
export class DiscussionsController {
  constructor(private readonly discussionsService: DiscussionsService) {}

  @Post()
  create(
    @CurrentUser('id') userId: string,
    @Body() createDto: CreateDiscussionDto,
  ) {
    return this.discussionsService.create(userId, createDto);
  }

  @Get('project/:projectId')
  findByProject(
    @Param('projectId') projectId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.discussionsService.findByProject(projectId, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.discussionsService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateDto: UpdateDiscussionDto,
  ) {
    return this.discussionsService.update(id, userId, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.discussionsService.remove(id, userId);
  }

  @Post('messages')
  createMessage(
    @CurrentUser('id') userId: string,
    @Body() createDto: CreateChatMessageDto,
  ) {
    return this.discussionsService.createMessage(userId, createDto);
  }

  @Get(':id/messages')
  getMessages(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.discussionsService.getMessages(id, userId);
  }

  @Patch('messages/:messageId/read')
  markMessageAsRead(
    @Param('messageId') messageId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.discussionsService.markMessageAsRead(messageId, userId);
  }
}
