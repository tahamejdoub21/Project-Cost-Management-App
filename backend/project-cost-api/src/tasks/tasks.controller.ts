import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have access to the project',
  })
  @ApiResponse({
    status: 404,
    description: 'Project, phase, or assignee not found',
  })
  create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    return this.tasksService.create(createTaskDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
  findAll(@Query() query: QueryTaskDto, @Request() req) {
    return this.tasksService.findAll(query, req.user.sub);
  }

  @Get('my-tasks')
  @ApiOperation({ summary: 'Get tasks assigned to current user' })
  @ApiResponse({ status: 200, description: 'My tasks retrieved successfully' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by task status',
  })
  getMyTasks(@Query('status') status: string, @Request() req) {
    return this.tasksService.getMyTasks(
      req.user.sub,
      status ? { status } : undefined,
    );
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all tasks for a specific project' })
  @ApiParam({ name: 'projectId', description: 'Project ID' })
  @ApiResponse({
    status: 200,
    description: 'Project tasks retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have access to the project',
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  getTasksByProject(@Param('projectId') projectId: string, @Request() req) {
    return this.tasksService.getTasksByProject(projectId, req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by ID' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task retrieved successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have access to this task',
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.tasksService.findOne(id, req.user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - User does not have permission to update this task',
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req,
  ) {
    return this.tasksService.update(id, updateTaskDto, req.user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - User does not have permission to delete this task',
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  remove(@Param('id') id: string, @Request() req) {
    return this.tasksService.remove(id, req.user.sub);
  }

  @Patch(':id/assign')
  @ApiOperation({ summary: 'Assign a task to a user' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task assigned successfully' })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - User does not have permission to assign this task',
  })
  @ApiResponse({ status: 404, description: 'Task or assignee not found' })
  assignTask(
    @Param('id') id: string,
    @Body() assignTaskDto: AssignTaskDto,
    @Request() req,
  ) {
    return this.tasksService.assignTask(id, assignTaskDto, req.user.sub);
  }

  @Patch(':id/unassign')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unassign a task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task unassigned successfully' })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - User does not have permission to unassign this task',
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  unassignTask(@Param('id') id: string, @Request() req) {
    return this.tasksService.unassignTask(id, req.user.sub);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update task status' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task status updated successfully' })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - User does not have permission to update this task status',
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
    @Request() req,
  ) {
    return this.tasksService.updateStatus(id, updateStatusDto, req.user.sub);
  }
}
