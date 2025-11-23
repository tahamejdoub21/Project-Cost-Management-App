import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto, userId: string) {
    const { projectId, phaseId, assigneeId, parentTaskId, ...taskData } = createTaskDto;

    // Verify project exists and user has access
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { teamMembers: true },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Check if user is project owner or team member
    const isProjectOwner = project.userId === userId;
    const isTeamMember = project.teamMembers.some((member) => member.userId === userId);

    if (!isProjectOwner && !isTeamMember) {
      throw new ForbiddenException('You do not have access to this project');
    }

    // Verify phase belongs to project if provided
    if (phaseId) {
      const phase = await this.prisma.projectPhase.findFirst({
        where: { id: phaseId, projectId },
      });

      if (!phase) {
        throw new NotFoundException(`Phase with ID ${phaseId} not found in this project`);
      }
    }

    // Verify assignee exists if provided
    if (assigneeId) {
      const assignee = await this.prisma.user.findUnique({
        where: { id: assigneeId },
      });

      if (!assignee) {
        throw new NotFoundException(`User with ID ${assigneeId} not found`);
      }
    }

    // Verify parent task exists and belongs to same project
    if (parentTaskId) {
      const parentTask = await this.prisma.task.findFirst({
        where: { id: parentTaskId, projectId },
      });

      if (!parentTask) {
        throw new NotFoundException(`Parent task with ID ${parentTaskId} not found in this project`);
      }
    }

    // Get the max order for tasks in this project to set the new task order
    if (taskData.order === undefined) {
      const maxOrder = await this.prisma.task.aggregate({
        where: { projectId },
        _max: { order: true },
      });
      taskData.order = (maxOrder._max.order || 0) + 1;
    }

    return this.prisma.task.create({
      data: {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
        estimatedHours: taskData.estimatedHours,
        actualHours: taskData.actualHours,
        progress: taskData.progress ?? 0,
        order: taskData.order,
        tags: taskData.tags ?? [],
        metadata: taskData.metadata,
        projectId,
        phaseId: phaseId || null,
        assigneeId: assigneeId || null,
        creatorId: userId,
        parentTaskId: parentTaskId || null,
      },
      include: {
        project: { select: { id: true, name: true, code: true } },
        phase: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
        creator: { select: { id: true, name: true, email: true, avatar: true } },
        parentTask: { select: { id: true, title: true } },
        subtasks: { select: { id: true, title: true, status: true } },
      },
    });
  }

  async findAll(query: QueryTaskDto, userId: string) {
    const {
      projectId,
      phaseId,
      assigneeId,
      creatorId,
      status,
      priority,
      search,
      tag,
      dueDateFrom,
      dueDateTo,
      unassigned,
      parentOnly,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = query;

    const where: Prisma.TaskWhereInput = {};

    // Filter by project
    if (projectId) {
      where.projectId = projectId;
    } else {
      // If no projectId specified, only show tasks from user's projects
      where.project = {
        OR: [
          { userId },
          { teamMembers: { some: { userId } } },
        ],
      };
    }

    if (phaseId) where.phaseId = phaseId;
    if (assigneeId) where.assigneeId = assigneeId;
    if (creatorId) where.creatorId = creatorId;
    if (status) where.status = status;
    if (priority) where.priority = priority;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tag) {
      where.tags = { has: tag };
    }

    if (dueDateFrom || dueDateTo) {
      where.dueDate = {};
      if (dueDateFrom) where.dueDate.gte = new Date(dueDateFrom);
      if (dueDateTo) where.dueDate.lte = new Date(dueDateTo);
    }

    if (unassigned) {
      where.assigneeId = null;
    }

    if (parentOnly) {
      where.parentTaskId = null;
    }

    const orderBy: Prisma.TaskOrderByWithRelationInput = {};
    if (sortBy === 'priority') {
      orderBy.priority = sortOrder;
    } else if (sortBy === 'status') {
      orderBy.status = sortOrder;
    } else if (sortBy === 'dueDate') {
      orderBy.dueDate = sortOrder;
    } else if (sortBy === 'order') {
      orderBy.order = sortOrder;
    } else if (sortBy === 'updatedAt') {
      orderBy.updatedAt = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          project: { select: { id: true, name: true, code: true } },
          phase: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true, email: true, avatar: true } },
          creator: { select: { id: true, name: true, email: true, avatar: true } },
          parentTask: { select: { id: true, title: true } },
          subtasks: { select: { id: true, title: true, status: true } },
          _count: {
            select: {
              comments: true,
              attachments: true,
              timeEntries: true,
            },
          },
        },
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      data: tasks,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            code: true,
            userId: true,
            teamMembers: true,
          },
        },
        phase: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
        creator: { select: { id: true, name: true, email: true, avatar: true } },
        parentTask: { select: { id: true, title: true } },
        subtasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            progress: true,
            assignee: { select: { id: true, name: true, avatar: true } },
          },
        },
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            user: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        attachments: {
          select: {
            id: true,
            name: true,
            fileName: true,
            fileSize: true,
            mimeType: true,
            createdAt: true,
          },
        },
        timeEntries: {
          select: {
            id: true,
            duration: true,
            description: true,
            startTime: true,
            endTime: true,
            user: { select: { id: true, name: true } },
          },
          orderBy: { startTime: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            comments: true,
            attachments: true,
            timeEntries: true,
            subtasks: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // Check if user has access to this task's project
    const isProjectOwner = task.project.userId === userId;
    const isTeamMember = task.project.teamMembers.some((member) => member.userId === userId);

    if (!isProjectOwner && !isTeamMember) {
      throw new ForbiddenException('You do not have access to this task');
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            userId: true,
            teamMembers: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // Check if user has access to modify this task
    const isProjectOwner = task.project.userId === userId;
    const isTeamMember = task.project.teamMembers.some((member) => member.userId === userId);

    if (!isProjectOwner && !isTeamMember && task.assigneeId !== userId) {
      throw new ForbiddenException('You do not have permission to update this task');
    }

    // Verify phase belongs to project if being updated
    if (updateTaskDto.phaseId !== undefined) {
      const phase = await this.prisma.projectPhase.findFirst({
        where: { id: updateTaskDto.phaseId, projectId: task.projectId },
      });

      if (!phase) {
        throw new NotFoundException(`Phase with ID ${updateTaskDto.phaseId} not found in this project`);
      }
    }

    // Verify assignee exists if being updated
    if (updateTaskDto.assigneeId !== undefined && updateTaskDto.assigneeId !== null) {
      const assignee = await this.prisma.user.findUnique({
        where: { id: updateTaskDto.assigneeId },
      });

      if (!assignee) {
        throw new NotFoundException(`User with ID ${updateTaskDto.assigneeId} not found`);
      }
    }

    // Verify parent task if being updated
    if (updateTaskDto.parentTaskId !== undefined && updateTaskDto.parentTaskId !== null) {
      if (updateTaskDto.parentTaskId === id) {
        throw new BadRequestException('A task cannot be its own parent');
      }

      const parentTask = await this.prisma.task.findFirst({
        where: { id: updateTaskDto.parentTaskId, projectId: task.projectId },
      });

      if (!parentTask) {
        throw new NotFoundException(`Parent task with ID ${updateTaskDto.parentTaskId} not found in this project`);
      }
    }

    const updateData: any = {};

    if (updateTaskDto.title !== undefined) updateData.title = updateTaskDto.title;
    if (updateTaskDto.description !== undefined) updateData.description = updateTaskDto.description;
    if (updateTaskDto.status !== undefined) updateData.status = updateTaskDto.status;
    if (updateTaskDto.priority !== undefined) updateData.priority = updateTaskDto.priority;
    if (updateTaskDto.dueDate !== undefined) updateData.dueDate = updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : null;
    if (updateTaskDto.estimatedHours !== undefined) updateData.estimatedHours = updateTaskDto.estimatedHours;
    if (updateTaskDto.actualHours !== undefined) updateData.actualHours = updateTaskDto.actualHours;
    if (updateTaskDto.progress !== undefined) updateData.progress = updateTaskDto.progress;
    if (updateTaskDto.order !== undefined) updateData.order = updateTaskDto.order;
    if (updateTaskDto.tags !== undefined) updateData.tags = updateTaskDto.tags;
    if (updateTaskDto.metadata !== undefined) updateData.metadata = updateTaskDto.metadata;
    if (updateTaskDto.phaseId !== undefined) updateData.phaseId = updateTaskDto.phaseId;
    if (updateTaskDto.assigneeId !== undefined) updateData.assigneeId = updateTaskDto.assigneeId;
    if (updateTaskDto.parentTaskId !== undefined) updateData.parentTaskId = updateTaskDto.parentTaskId;

    return this.prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        project: { select: { id: true, name: true, code: true } },
        phase: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
        creator: { select: { id: true, name: true, email: true, avatar: true } },
        parentTask: { select: { id: true, title: true } },
        subtasks: { select: { id: true, title: true, status: true } },
      },
    });
  }

  async remove(id: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            userId: true,
            teamMembers: { select: { userId: true, role: true } },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // Only project owner, task creator, or team managers can delete tasks
    const isProjectOwner = task.project.userId === userId;
    const isTaskCreator = task.creatorId === userId;
    const isManager = task.project.teamMembers.some(
      (member) => member.userId === userId && ['OWNER', 'MANAGER', 'LEAD'].includes(member.role),
    );

    if (!isProjectOwner && !isTaskCreator && !isManager) {
      throw new ForbiddenException('You do not have permission to delete this task');
    }

    await this.prisma.task.delete({ where: { id } });

    return { message: 'Task deleted successfully' };
  }

  async assignTask(id: string, assignTaskDto: AssignTaskDto, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            userId: true,
            teamMembers: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // Check if user has access to modify this task
    const isProjectOwner = task.project.userId === userId;
    const isTeamMember = task.project.teamMembers.some((member) => member.userId === userId);

    if (!isProjectOwner && !isTeamMember) {
      throw new ForbiddenException('You do not have permission to assign this task');
    }

    // Verify assignee exists
    const assignee = await this.prisma.user.findUnique({
      where: { id: assignTaskDto.assigneeId },
    });

    if (!assignee) {
      throw new NotFoundException(`User with ID ${assignTaskDto.assigneeId} not found`);
    }

    return this.prisma.task.update({
      where: { id },
      data: { assigneeId: assignTaskDto.assigneeId },
      include: {
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });
  }

  async unassignTask(id: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            userId: true,
            teamMembers: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // Check if user has access to modify this task
    const isProjectOwner = task.project.userId === userId;
    const isTeamMember = task.project.teamMembers.some((member) => member.userId === userId);

    if (!isProjectOwner && !isTeamMember) {
      throw new ForbiddenException('You do not have permission to unassign this task');
    }

    return this.prisma.task.update({
      where: { id },
      data: { assigneeId: null },
    });
  }

  async updateStatus(id: string, updateStatusDto: UpdateStatusDto, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            userId: true,
            teamMembers: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // Check if user has access to modify this task
    const isProjectOwner = task.project.userId === userId;
    const isTeamMember = task.project.teamMembers.some((member) => member.userId === userId);
    const isAssignee = task.assigneeId === userId;

    if (!isProjectOwner && !isTeamMember && !isAssignee) {
      throw new ForbiddenException('You do not have permission to update this task status');
    }

    return this.prisma.task.update({
      where: { id },
      data: { status: updateStatusDto.status },
      include: {
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });
  }

  async getTasksByProject(projectId: string, userId: string) {
    // Verify user has access to project
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { teamMembers: true },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const isProjectOwner = project.userId === userId;
    const isTeamMember = project.teamMembers.some((member) => member.userId === userId);

    if (!isProjectOwner && !isTeamMember) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return this.prisma.task.findMany({
      where: { projectId },
      orderBy: { order: 'asc' },
      include: {
        phase: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
        creator: { select: { id: true, name: true, email: true, avatar: true } },
        subtasks: { select: { id: true, title: true, status: true } },
        _count: {
          select: {
            comments: true,
            attachments: true,
            timeEntries: true,
          },
        },
      },
    });
  }

  async getMyTasks(userId: string, query?: { status?: string }) {
    const where: Prisma.TaskWhereInput = {
      assigneeId: userId,
    };

    if (query?.status) {
      where.status = query.status as any;
    }

    return this.prisma.task.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
      include: {
        project: { select: { id: true, name: true, code: true } },
        phase: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true, email: true, avatar: true } },
        _count: {
          select: {
            comments: true,
            attachments: true,
            subtasks: true,
          },
        },
      },
    });
  }
}
