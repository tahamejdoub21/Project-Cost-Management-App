import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ProjectStatisticsFilterDto,
  CostStatisticsFilterDto,
  TaskStatisticsFilterDto,
  TeamStatisticsFilterDto,
  TimeStatisticsFilterDto,
} from './dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  async getProjectStatistics(
    userId: string,
    userRole: UserRole,
    filters: ProjectStatisticsFilterDto,
  ) {
    const where: any = {};

    if (userRole !== UserRole.SUPER_ADMIN && userRole !== UserRole.ADMIN) {
      where.OR = [
        { userId },
        { teamMembers: { some: { userId, isActive: true } } },
      ];
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.userId && (userRole === UserRole.SUPER_ADMIN || userRole === UserRole.ADMIN)) {
      where.userId = filters.userId;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    if (filters.projectId) {
      where.id = filters.projectId;
    }

    const [totalProjects, projectsByStatus, projectsByPriority, budgetAnalysis] =
      await Promise.all([
        this.prisma.project.count({ where }),
        this.prisma.project.groupBy({
          by: ['status'],
          where,
          _count: { _all: true },
        }),
        this.prisma.project.groupBy({
          by: ['priority'],
          where,
          _count: { _all: true },
        }),
        this.prisma.project.aggregate({
          where,
          _sum: { totalBudget: true, actualCost: true },
          _avg: { progress: true },
        }),
      ]);

    const topProjects = await this.prisma.project.findMany({
      where,
      select: {
        id: true,
        name: true,
        code: true,
        status: true,
        priority: true,
        totalBudget: true,
        actualCost: true,
        progress: true,
        startDate: true,
        endDate: true,
      },
      orderBy: { actualCost: 'desc' },
      take: 10,
    });

    return {
      total: totalProjects,
      byStatus: projectsByStatus,
      byPriority: projectsByPriority,
      budget: {
        totalBudget: budgetAnalysis._sum.totalBudget || 0,
        totalActualCost: budgetAnalysis._sum.actualCost || 0,
        averageProgress: budgetAnalysis._avg.progress || 0,
      },
      topProjects,
    };
  }

  async getCostStatistics(
    userId: string,
    userRole: UserRole,
    filters: CostStatisticsFilterDto,
  ) {
    const where: any = {};

    if (userRole !== UserRole.SUPER_ADMIN && userRole !== UserRole.ADMIN) {
      where.project = {
        OR: [
          { userId },
          { teamMembers: { some: { userId, isActive: true } } },
        ],
      };
    }

    if (filters.projectId) {
      where.projectId = filters.projectId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.phaseId) {
      where.phaseId = filters.phaseId;
    }

    if (filters.startDate || filters.endDate) {
      where.dateIncurred = {};
      if (filters.startDate) {
        where.dateIncurred.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.dateIncurred.lte = new Date(filters.endDate);
      }
    }

    const [totalCosts, costsByType, costsByStatus, costsByCategory, costSummary] =
      await Promise.all([
        this.prisma.cost.count({ where }),
        this.prisma.cost.groupBy({
          by: ['type'],
          where,
          _count: { _all: true },
          _sum: { amount: true },
        }),
        this.prisma.cost.groupBy({
          by: ['status'],
          where,
          _count: { _all: true },
          _sum: { amount: true },
        }),
        this.prisma.cost.groupBy({
          by: ['categoryId'],
          where,
          _count: { _all: true },
          _sum: { amount: true },
        }),
        this.prisma.cost.aggregate({
          where,
          _sum: { amount: true },
          _avg: { amount: true },
        }),
      ]);

    const categoriesWithNames = await Promise.all(
      costsByCategory.map(async (item) => {
        const category = await this.prisma.costCategory.findUnique({
          where: { id: item.categoryId },
          select: { name: true, color: true },
        });
        return {
          categoryId: item.categoryId,
          categoryName: category?.name || 'Unknown',
          color: category?.color || '#6B7280',
          count: item._count._all,
          total: item._sum.amount || 0,
        };
      }),
    );

    const topCosts = await this.prisma.cost.findMany({
      where,
      select: {
        id: true,
        title: true,
        amount: true,
        type: true,
        status: true,
        dateIncurred: true,
        category: {
          select: { name: true, color: true },
        },
        project: {
          select: { name: true, code: true },
        },
      },
      orderBy: { amount: 'desc' },
      take: 10,
    });

    return {
      total: totalCosts,
      byType: costsByType,
      byStatus: costsByStatus,
      byCategory: categoriesWithNames,
      summary: {
        totalAmount: costSummary._sum.amount || 0,
        averageAmount: costSummary._avg.amount || 0,
      },
      topCosts,
    };
  }

  async getTaskStatistics(
    userId: string,
    userRole: UserRole,
    filters: TaskStatisticsFilterDto,
  ) {
    const where: any = {};

    if (userRole !== UserRole.SUPER_ADMIN && userRole !== UserRole.ADMIN) {
      where.project = {
        OR: [
          { userId },
          { teamMembers: { some: { userId, isActive: true } } },
        ],
      };
    }

    if (filters.projectId) {
      where.projectId = filters.projectId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.assigneeId) {
      where.assigneeId = filters.assigneeId;
    }

    if (filters.phaseId) {
      where.phaseId = filters.phaseId;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    const [
      totalTasks,
      tasksByStatus,
      tasksByPriority,
      taskSummary,
      overdueTasks,
    ] = await Promise.all([
      this.prisma.task.count({ where }),
      this.prisma.task.groupBy({
        by: ['status'],
        where,
        _count: { _all: true },
      }),
      this.prisma.task.groupBy({
        by: ['priority'],
        where,
        _count: { _all: true },
      }),
      this.prisma.task.aggregate({
        where,
        _avg: { progress: true, estimatedHours: true, actualHours: true },
        _sum: { estimatedHours: true, actualHours: true },
      }),
      this.prisma.task.count({
        where: {
          ...where,
          dueDate: { lt: new Date() },
          status: { notIn: ['DONE', 'CANCELLED'] },
        },
      }),
    ]);

    const tasksByAssignee = await this.prisma.task.groupBy({
      by: ['assigneeId'],
      where: { ...where, assigneeId: { not: null } },
      _count: { _all: true },
    });

    const assigneesWithNames = await Promise.all(
      tasksByAssignee
        .filter((item) => item.assigneeId)
        .map(async (item) => {
          const user = await this.prisma.user.findUnique({
            where: { id: item.assigneeId! },
            select: { name: true, email: true },
          });
          return {
            userId: item.assigneeId,
            userName: user?.name || 'Unknown',
            userEmail: user?.email || '',
            taskCount: item._count._all,
          };
        }),
    );

    const completionRate =
      totalTasks > 0
        ? (tasksByStatus.find((t) => t.status === 'DONE')?._count._all || 0) /
          totalTasks
        : 0;

    return {
      total: totalTasks,
      byStatus: tasksByStatus,
      byPriority: tasksByPriority,
      byAssignee: assigneesWithNames,
      summary: {
        averageProgress: taskSummary._avg.progress || 0,
        totalEstimatedHours: taskSummary._sum.estimatedHours || 0,
        totalActualHours: taskSummary._sum.actualHours || 0,
        averageEstimatedHours: taskSummary._avg.estimatedHours || 0,
        averageActualHours: taskSummary._avg.actualHours || 0,
        completionRate: completionRate * 100,
        overdueTasks,
      },
    };
  }

  async getTeamStatistics(
    userId: string,
    userRole: UserRole,
    filters: TeamStatisticsFilterDto,
  ) {
    const where: any = {};

    if (userRole !== UserRole.SUPER_ADMIN && userRole !== UserRole.ADMIN) {
      where.project = {
        OR: [
          { userId },
          { teamMembers: { some: { userId, isActive: true } } },
        ],
      };
    }

    if (filters.projectId) {
      where.projectId = filters.projectId;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    const [totalMembers, membersByRole, activeMembers] = await Promise.all([
      this.prisma.teamMember.count({ where }),
      this.prisma.teamMember.groupBy({
        by: ['role'],
        where,
        _count: { _all: true },
      }),
      this.prisma.teamMember.count({ where: { ...where, isActive: true } }),
    ]);

    const teamMembersWithDetails = await this.prisma.teamMember.findMany({
      where,
      select: {
        id: true,
        role: true,
        joinedAt: true,
        isActive: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
      take: 50,
    });

    const ratingsData = await this.prisma.teamRating.groupBy({
      by: ['ratedUserId'],
      where: filters.projectId ? { projectId: filters.projectId } : {},
      _avg: { rating: true },
      _count: { _all: true },
    });

    const ratingsWithNames = await Promise.all(
      ratingsData.map(async (item) => {
        const user = await this.prisma.user.findUnique({
          where: { id: item.ratedUserId },
          select: { name: true, email: true },
        });
        return {
          userId: item.ratedUserId,
          userName: user?.name || 'Unknown',
          userEmail: user?.email || '',
          averageRating: item._avg.rating || 0,
          ratingCount: item._count._all,
        };
      }),
    );

    return {
      total: totalMembers,
      active: activeMembers,
      byRole: membersByRole,
      members: teamMembersWithDetails,
      ratings: ratingsWithNames,
    };
  }

  async getTimeStatistics(
    userId: string,
    userRole: UserRole,
    filters: TimeStatisticsFilterDto,
  ) {
    const where: any = {};

    if (userRole !== UserRole.SUPER_ADMIN && userRole !== UserRole.ADMIN) {
      where.task = {
        project: {
          OR: [
            { userId },
            { teamMembers: { some: { userId, isActive: true } } },
          ],
        },
      };
    }

    if (filters.projectId) {
      where.task = { projectId: filters.projectId };
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.taskId) {
      where.taskId = filters.taskId;
    }

    if (filters.startDate || filters.endDate) {
      where.startTime = {};
      if (filters.startDate) {
        where.startTime.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.startTime.lte = new Date(filters.endDate);
      }
    }

    const [totalEntries, timeSummary, billableEntries, nonBillableEntries] =
      await Promise.all([
        this.prisma.timeEntry.count({ where }),
        this.prisma.timeEntry.aggregate({
          where,
          _sum: { duration: true },
          _avg: { duration: true },
        }),
        this.prisma.timeEntry.aggregate({
          where: { ...where, billable: true },
          _sum: { duration: true },
        }),
        this.prisma.timeEntry.aggregate({
          where: { ...where, billable: false },
          _sum: { duration: true },
        }),
      ]);

    const timeByUser = await this.prisma.timeEntry.groupBy({
      by: ['userId'],
      where,
      _sum: { duration: true },
      _count: { _all: true },
    });

    const usersWithTime = await Promise.all(
      timeByUser.map(async (item) => {
        const user = await this.prisma.user.findUnique({
          where: { id: item.userId },
          select: { name: true, email: true },
        });
        return {
          userId: item.userId,
          userName: user?.name || 'Unknown',
          userEmail: user?.email || '',
          totalHours: item._sum.duration || 0,
          entryCount: item._count._all,
        };
      }),
    );

    const recentEntries = await this.prisma.timeEntry.findMany({
      where,
      select: {
        id: true,
        startTime: true,
        endTime: true,
        duration: true,
        billable: true,
        description: true,
        user: {
          select: { name: true, email: true },
        },
        task: {
          select: {
            title: true,
            project: {
              select: { name: true, code: true },
            },
          },
        },
      },
      orderBy: { startTime: 'desc' },
      take: 20,
    });

    return {
      total: totalEntries,
      summary: {
        totalHours: timeSummary._sum.duration || 0,
        averageHours: timeSummary._avg.duration || 0,
        billableHours: billableEntries._sum.duration || 0,
        nonBillableHours: nonBillableEntries._sum.duration || 0,
      },
      byUser: usersWithTime,
      recentEntries,
    };
  }

  async getDashboardStatistics(userId: string, userRole: UserRole) {
    const projectWhere: any = {};
    const taskWhere: any = {};
    const costWhere: any = {};

    if (userRole !== UserRole.SUPER_ADMIN && userRole !== UserRole.ADMIN) {
      const accessCondition = {
        OR: [
          { userId },
          { teamMembers: { some: { userId, isActive: true } } },
        ],
      };
      projectWhere.OR = accessCondition.OR;
      taskWhere.project = accessCondition;
      costWhere.project = accessCondition;
    }

    const [
      totalProjects,
      activeProjects,
      totalTasks,
      completedTasks,
      overdueTasks,
      totalCosts,
      pendingCosts,
      myTasks,
      recentProjects,
    ] = await Promise.all([
      this.prisma.project.count({ where: projectWhere }),
      this.prisma.project.count({
        where: { ...projectWhere, status: 'ACTIVE' },
      }),
      this.prisma.task.count({ where: taskWhere }),
      this.prisma.task.count({
        where: { ...taskWhere, status: 'DONE' },
      }),
      this.prisma.task.count({
        where: {
          ...taskWhere,
          dueDate: { lt: new Date() },
          status: { notIn: ['DONE', 'CANCELLED'] },
        },
      }),
      this.prisma.cost.aggregate({
        where: costWhere,
        _sum: { amount: true },
      }),
      this.prisma.cost.aggregate({
        where: { ...costWhere, status: 'PENDING' },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.task.count({
        where: {
          ...taskWhere,
          assigneeId: userId,
          status: { notIn: ['DONE', 'CANCELLED'] },
        },
      }),
      this.prisma.project.findMany({
        where: projectWhere,
        select: {
          id: true,
          name: true,
          code: true,
          status: true,
          priority: true,
          progress: true,
          startDate: true,
          endDate: true,
        },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
    ]);

    const upcomingDeadlines = await this.prisma.task.findMany({
      where: {
        ...taskWhere,
        dueDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        status: { notIn: ['DONE', 'CANCELLED'] },
      },
      select: {
        id: true,
        title: true,
        dueDate: true,
        priority: true,
        status: true,
        project: {
          select: { name: true, code: true },
        },
      },
      orderBy: { dueDate: 'asc' },
      take: 10,
    });

    return {
      overview: {
        totalProjects,
        activeProjects,
        totalTasks,
        completedTasks,
        overdueTasks,
        myTasks,
        totalCosts: totalCosts._sum.amount || 0,
        pendingCostsAmount: pendingCosts._sum.amount || 0,
        pendingCostsCount: pendingCosts._count || 0,
      },
      recentProjects,
      upcomingDeadlines,
    };
  }
}
