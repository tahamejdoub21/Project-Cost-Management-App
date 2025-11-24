import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskCommentDto } from './dto/create-task-comment.dto';
import { UpdateTaskCommentDto } from './dto/update-task-comment.dto';

@Injectable()
export class TaskCommentsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDto: CreateTaskCommentDto) {
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
      throw new ForbiddenException('Not authorized to comment on this task');
    }

    if (createDto.parentId) {
      const parentComment = await this.prisma.taskComment.findUnique({
        where: { id: createDto.parentId },
      });

      if (!parentComment || parentComment.taskId !== createDto.taskId) {
        throw new NotFoundException('Parent comment not found');
      }
    }

    return this.prisma.taskComment.create({
      data: {
        content: createDto.content,
        taskId: createDto.taskId,
        userId,
        parentId: createDto.parentId,
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
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
  }

  async findByTask(taskId: string, userId: string) {
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
      throw new ForbiddenException('Not authorized to view task comments');
    }

    return this.prisma.taskComment.findMany({
      where: {
        taskId,
        parentId: null,
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
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const comment = await this.prisma.taskComment.findUnique({
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
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const isMember = comment.task.project.teamMembers.some(
      (member) => member.userId === userId && member.isActive,
    );

    if (comment.task.project.userId !== userId && !isMember) {
      throw new ForbiddenException('Not authorized to view this comment');
    }

    return comment;
  }

  async update(id: string, userId: string, updateDto: UpdateTaskCommentDto) {
    const comment = await this.findOne(id, userId);

    if (comment.userId !== userId) {
      throw new ForbiddenException('Not authorized to update this comment');
    }

    return this.prisma.taskComment.update({
      where: { id },
      data: { content: updateDto.content },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const comment = await this.findOne(id, userId);

    if (comment.userId !== userId) {
      throw new ForbiddenException('Not authorized to delete this comment');
    }

    return this.prisma.taskComment.delete({
      where: { id },
    });
  }
}
