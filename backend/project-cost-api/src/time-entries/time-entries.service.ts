import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { UpdateTimeEntryDto } from './dto/update-time-entry.dto';
import { QueryTimeEntryDto } from './dto/query-time-entry.dto';

@Injectable()
export class TimeEntriesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDto: CreateTimeEntryDto) {
    const task = await this.prisma.task.findUnique({
      where: { id: createDto.taskId },
      include: { project: { include: { teamMembers: true } } },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const isMember = task.project.teamMembers.some(
      (member) => member.userId === userId && member.isActive,
    );

    if (!isMember && task.project.userId !== userId) {
      throw new ForbiddenException('Not authorized to log time on this task');
    }

    let duration = createDto.duration;
    if (!duration && createDto.endTime) {
      const start = new Date(createDto.startTime);
      const end = new Date(createDto.endTime);
      duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }

    return this.prisma.timeEntry.create({
      data: {
        ...createDto,
        userId,
        duration,
        startTime: new Date(createDto.startTime),
        endTime: createDto.endTime ? new Date(createDto.endTime) : null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            projectId: true,
          },
        },
      },
    });
  }

  async findAll(userId: string, query: QueryTimeEntryDto) {
    const where: any = {};

    if (query.taskId) {
      const task = await this.prisma.task.findUnique({
        where: { id: query.taskId },
        include: { project: { include: { teamMembers: true } } },
      });

      if (!task) {
        throw new NotFoundException('Task not found');
      }

      const isMember = task.project.teamMembers.some(
        (member) => member.userId === userId && member.isActive,
      );

      if (!isMember && task.project.userId !== userId) {
        throw new ForbiddenException(
          'Not authorized to view these time entries',
        );
      }

      where.taskId = query.taskId;
    }

    if (query.userId) {
      where.userId = query.userId;
    }

    if (query.startDate || query.endDate) {
      where.startTime = {};
      if (query.startDate) {
        where.startTime.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.startTime.lte = new Date(query.endDate);
      }
    }

    if (query.billable !== undefined) {
      where.billable = query.billable;
    }

    return this.prisma.timeEntry.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            projectId: true,
          },
        },
      },
      orderBy: { startTime: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const timeEntry = await this.prisma.timeEntry.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        task: {
          include: {
            project: {
              include: {
                teamMembers: true,
              },
            },
          },
        },
      },
    });

    if (!timeEntry) {
      throw new NotFoundException('Time entry not found');
    }

    const isMember = timeEntry.task.project.teamMembers.some(
      (member) => member.userId === userId && member.isActive,
    );

    if (
      timeEntry.userId !== userId &&
      timeEntry.task.project.userId !== userId &&
      !isMember
    ) {
      throw new ForbiddenException('Not authorized to view this time entry');
    }

    return timeEntry;
  }

  async update(id: string, userId: string, updateDto: UpdateTimeEntryDto) {
    const timeEntry = await this.findOne(id, userId);

    if (timeEntry.userId !== userId) {
      throw new ForbiddenException('Not authorized to update this time entry');
    }

    let duration = updateDto.duration;
    if (!duration && updateDto.endTime && updateDto.startTime) {
      const start = new Date(updateDto.startTime);
      const end = new Date(updateDto.endTime);
      duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }

    return this.prisma.timeEntry.update({
      where: { id },
      data: {
        ...updateDto,
        duration,
        startTime: updateDto.startTime
          ? new Date(updateDto.startTime)
          : undefined,
        endTime: updateDto.endTime ? new Date(updateDto.endTime) : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            projectId: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const timeEntry = await this.findOne(id, userId);

    if (timeEntry.userId !== userId) {
      throw new ForbiddenException('Not authorized to delete this time entry');
    }

    return this.prisma.timeEntry.delete({
      where: { id },
    });
  }

  async getTaskTimeStats(taskId: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { include: { teamMembers: true } } },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const isMember = task.project.teamMembers.some(
      (member) => member.userId === userId && member.isActive,
    );

    if (!isMember && task.project.userId !== userId) {
      throw new ForbiddenException('Not authorized to view task time stats');
    }

    const timeEntries = await this.prisma.timeEntry.findMany({
      where: { taskId },
    });

    const totalHours = timeEntries.reduce(
      (sum, entry) => sum + (entry.duration || 0),
      0,
    );
    const billableHours = timeEntries
      .filter((entry) => entry.billable)
      .reduce((sum, entry) => sum + (entry.duration || 0), 0);

    return {
      totalEntries: timeEntries.length,
      totalHours,
      billableHours,
      nonBillableHours: totalHours - billableHours,
      estimatedHours: task.estimatedHours || 0,
      actualHours: task.actualHours || 0,
      variance: (task.estimatedHours || 0) - totalHours,
    };
  }
}
