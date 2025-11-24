import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDiscussionDto } from './dto/create-discussion.dto';
import { UpdateDiscussionDto } from './dto/update-discussion.dto';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { ChatGateway } from '../websocket/chat.gateway';

@Injectable()
export class DiscussionsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => ChatGateway))
    private chatGateway: ChatGateway,
  ) {}

  async create(userId: string, createDto: CreateDiscussionDto) {
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
      throw new ForbiddenException(
        'Not authorized to create discussions in this project',
      );
    }

    return this.prisma.discussion.create({
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
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
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
      throw new ForbiddenException(
        'Not authorized to view project discussions',
      );
    }

    return this.prisma.discussion.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
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
        _count: {
          select: { messages: true },
        },
      },
      orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
    });
  }

  async findOne(id: string, userId: string) {
    const discussion = await this.prisma.discussion.findUnique({
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
        project: {
          include: {
            teamMembers: true,
          },
        },
        messages: {
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
    });

    if (!discussion) {
      throw new NotFoundException('Discussion not found');
    }

    const isMember = discussion.project.teamMembers.some(
      (member) => member.userId === userId && member.isActive,
    );

    if (discussion.project.userId !== userId && !isMember) {
      throw new ForbiddenException('Not authorized to view this discussion');
    }

    return discussion;
  }

  async update(id: string, userId: string, updateDto: UpdateDiscussionDto) {
    const discussion = await this.findOne(id, userId);

    if (discussion.userId !== userId) {
      throw new ForbiddenException('Not authorized to update this discussion');
    }

    return this.prisma.discussion.update({
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
      },
    });
  }

  async remove(id: string, userId: string) {
    const discussion = await this.findOne(id, userId);

    if (discussion.userId !== userId) {
      throw new ForbiddenException('Not authorized to delete this discussion');
    }

    return this.prisma.discussion.delete({
      where: { id },
    });
  }

  async createMessage(userId: string, createDto: CreateChatMessageDto) {
    if (createDto.discussionId) {
      const discussion = await this.prisma.discussion.findUnique({
        where: { id: createDto.discussionId },
        include: { project: { include: { teamMembers: true } } },
      });

      if (!discussion) {
        throw new NotFoundException('Discussion not found');
      }

      const isMember = discussion.project.teamMembers.some(
        (member) => member.userId === userId && member.isActive,
      );

      if (!isMember && discussion.project.userId !== userId) {
        throw new ForbiddenException(
          'Not authorized to post in this discussion',
        );
      }
    } else if (createDto.projectId) {
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
        throw new ForbiddenException('Not authorized to post in this project');
      }
    }

    const message = await this.prisma.chatMessage.create({
      data: {
        ...createDto,
        userId,
        readBy: [userId],
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
      },
    });

    if (createDto.discussionId) {
      this.chatGateway.sendMessageToDiscussion(createDto.discussionId, message);
    } else if (createDto.projectId) {
      this.chatGateway.sendMessageToProject(createDto.projectId, message);
    }

    return message;
  }

  async getMessages(discussionId: string, userId: string) {
    await this.findOne(discussionId, userId);

    return this.prisma.chatMessage.findMany({
      where: { discussionId },
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
    });
  }

  async markMessageAsRead(messageId: string, userId: string) {
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (!message.readBy.includes(userId)) {
      return this.prisma.chatMessage.update({
        where: { id: messageId },
        data: {
          readBy: {
            push: userId,
          },
        },
      });
    }

    return message;
  }
}
