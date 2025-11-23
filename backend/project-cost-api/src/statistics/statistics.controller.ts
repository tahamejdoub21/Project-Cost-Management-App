import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import {
  ProjectStatisticsFilterDto,
  CostStatisticsFilterDto,
  TaskStatisticsFilterDto,
  TeamStatisticsFilterDto,
  TimeStatisticsFilterDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('statistics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('dashboard')
  async getDashboard(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.statisticsService.getDashboardStatistics(userId, userRole);
  }

  @Get('projects')
  async getProjectStatistics(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Query() filters: ProjectStatisticsFilterDto,
  ) {
    return this.statisticsService.getProjectStatistics(
      userId,
      userRole,
      filters,
    );
  }

  @Get('costs')
  async getCostStatistics(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Query() filters: CostStatisticsFilterDto,
  ) {
    return this.statisticsService.getCostStatistics(userId, userRole, filters);
  }

  @Get('tasks')
  async getTaskStatistics(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Query() filters: TaskStatisticsFilterDto,
  ) {
    return this.statisticsService.getTaskStatistics(userId, userRole, filters);
  }

  @Get('team')
  async getTeamStatistics(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Query() filters: TeamStatisticsFilterDto,
  ) {
    return this.statisticsService.getTeamStatistics(userId, userRole, filters);
  }

  @Get('time')
  async getTimeStatistics(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Query() filters: TimeStatisticsFilterDto,
  ) {
    return this.statisticsService.getTimeStatistics(userId, userRole, filters);
  }
}
