import { IsOptional, IsDateString, IsEnum, IsString } from 'class-validator';
import { ProjectStatus, TaskStatus, CostStatus, CostType } from '@prisma/client';

export class BaseStatisticsFilterDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  projectId?: string;
}

export class ProjectStatisticsFilterDto extends BaseStatisticsFilterDto {
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsOptional()
  @IsString()
  userId?: string;
}

export class CostStatisticsFilterDto extends BaseStatisticsFilterDto {
  @IsOptional()
  @IsEnum(CostStatus)
  status?: CostStatus;

  @IsOptional()
  @IsEnum(CostType)
  type?: CostType;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  phaseId?: string;
}

export class TaskStatisticsFilterDto extends BaseStatisticsFilterDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsString()
  assigneeId?: string;

  @IsOptional()
  @IsString()
  phaseId?: string;
}

export class TeamStatisticsFilterDto extends BaseStatisticsFilterDto {
  @IsOptional()
  @IsString()
  userId?: string;
}

export class TimeStatisticsFilterDto extends BaseStatisticsFilterDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  taskId?: string;
}
