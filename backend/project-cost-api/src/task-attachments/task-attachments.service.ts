import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskAttachmentDto } from './dto/create-task-attachment.dto';
import { UpdateTaskAttachmentDto } from './dto/update-task-attachment.dto';

@Injectable()
export class TaskAttachmentsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDto: CreateTaskAttachmentDto) {
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
      throw new ForbiddenException(
        'Not authorized to add attachments to this task',
      );
    }

    return this.prisma.taskAttachment.create({
      data: {
        ...createDto,
        userId,
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
      throw new ForbiddenException('Not authorized to view task attachments');
    }

    return this.prisma.taskAttachment.findMany({
      where: { taskId },
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
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const attachment = await this.prisma.taskAttachment.findUnique({
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

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    const isMember = attachment.task.project.teamMembers.some(
      (member) => member.userId === userId && member.isActive,
    );

    if (attachment.task.project.userId !== userId && !isMember) {
      throw new ForbiddenException('Not authorized to view this attachment');
    }

    return attachment;
  }

  async update(id: string, userId: string, updateDto: UpdateTaskAttachmentDto) {
    const attachment = await this.findOne(id, userId);

    if (attachment.userId !== userId) {
      throw new ForbiddenException('Not authorized to update this attachment');
    }

    return this.prisma.taskAttachment.update({
      where: { id },
      data: updateDto,
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
    const attachment = await this.findOne(id, userId);

    if (attachment.userId !== userId) {
      throw new ForbiddenException('Not authorized to delete this attachment');
    }

    return this.prisma.taskAttachment.delete({
      where: { id },
    });
  }
}
