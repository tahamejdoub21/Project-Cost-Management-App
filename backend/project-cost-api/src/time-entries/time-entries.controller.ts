import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TimeEntriesService } from './time-entries.service';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { UpdateTimeEntryDto } from './dto/update-time-entry.dto';
import { QueryTimeEntryDto } from './dto/query-time-entry.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('time-entries')
@UseGuards(JwtAuthGuard)
export class TimeEntriesController {
  constructor(private readonly timeEntriesService: TimeEntriesService) {}

  @Post()
  create(
    @CurrentUser('id') userId: string,
    @Body() createDto: CreateTimeEntryDto,
  ) {
    return this.timeEntriesService.create(userId, createDto);
  }

  @Get()
  findAll(
    @CurrentUser('id') userId: string,
    @Query() query: QueryTimeEntryDto,
  ) {
    return this.timeEntriesService.findAll(userId, query);
  }

  @Get('task/:taskId/stats')
  getTaskTimeStats(
    @Param('taskId') taskId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.timeEntriesService.getTaskTimeStats(taskId, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.timeEntriesService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateDto: UpdateTimeEntryDto,
  ) {
    return this.timeEntriesService.update(id, userId, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.timeEntriesService.remove(id, userId);
  }
}
