import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectAttachmentDto } from './dto/create-project-attachment.dto';

@Injectable()
export class ProjectAttachmentsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDto: CreateProjectAttachmentDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: createDto.projectId },
      include: { teamMembers: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const isMember = project.teamMembers.some(
      (member) => member.userId === userId && member.isActive,
    );

    if (!isMember && project.userId !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    return this.prisma.projectAttachment.create({
      data: { ...createDto, userId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });
  }

  async findByProject(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { teamMembers: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const isMember = project.teamMembers.some(
      (member) => member.userId === userId && member.isActive,
    );

    if (!isMember && project.userId !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    return this.prisma.projectAttachment.findMany({
      where: { projectId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string, userId: string) {
    const attachment = await this.prisma.projectAttachment.findUnique({
      where: { id },
      include: { project: { include: { teamMembers: true } } },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    if (attachment.userId !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    return this.prisma.projectAttachment.delete({ where: { id } });
  }
}
