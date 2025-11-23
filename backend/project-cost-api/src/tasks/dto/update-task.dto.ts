import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
  IsDateString,
  IsUUID,
  Min,
  IsObject,
} from 'class-validator';
import { TaskStatus, TaskPriority } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTaskDto {
  @ApiPropertyOptional({ description: 'Task title', example: 'Implement user authentication' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Task description', example: 'Add JWT authentication to the API' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: TaskStatus, description: 'Task status' })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({ enum: TaskPriority, description: 'Task priority' })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional({ description: 'Due date for the task', example: '2025-12-31T23:59:59Z' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Estimated hours to complete', example: 8.5, minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  estimatedHours?: number;

  @ApiPropertyOptional({ description: 'Actual hours spent', example: 6.5, minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  actualHours?: number;

  @ApiPropertyOptional({ description: 'Task progress percentage', example: 50, minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  progress?: number;

  @ApiPropertyOptional({ description: 'Task order/position', example: 1, minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({ description: 'Task tags', example: ['backend', 'api', 'security'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Additional metadata as JSON', example: { customField: 'value' } })
  @IsObject()
  @IsOptional()
  metadata?: any;

  @ApiPropertyOptional({ description: 'Phase ID the task belongs to' })
  @IsUUID()
  @IsOptional()
  phaseId?: string;

  @ApiPropertyOptional({ description: 'User ID to assign the task to' })
  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  @ApiPropertyOptional({ description: 'Parent task ID for subtasks' })
  @IsUUID()
  @IsOptional()
  parentTaskId?: string;
}
