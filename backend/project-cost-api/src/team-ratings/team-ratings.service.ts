import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamRatingDto } from './dto/create-team-rating.dto';

@Injectable()
export class TeamRatingsService {
  constructor(private prisma: PrismaService) {}

  async create(raterId: string, createDto: CreateTeamRatingDto) {
    if (raterId === createDto.ratedUserId) {
      throw new BadRequestException('Cannot rate yourself');
    }

    const project = await this.prisma.project.findUnique({
      where: { id: createDto.projectId },
      include: { teamMembers: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const isRaterMember = project.teamMembers.some(
      (member) => member.userId === raterId && member.isActive,
    );
    const isRatedMember = project.teamMembers.some(
      (member) => member.userId === createDto.ratedUserId && member.isActive,
    );

    if (!isRaterMember && project.userId !== raterId) {
      throw new ForbiddenException('Not authorized to rate in this project');
    }

    if (!isRatedMember && project.userId !== createDto.ratedUserId) {
      throw new NotFoundException('Rated user is not part of this project');
    }

    return this.prisma.teamRating.upsert({
      where: {
        raterId_ratedUserId_projectId: {
          raterId,
          ratedUserId: createDto.ratedUserId,
          projectId: createDto.projectId,
        },
      },
      create: {
        ...createDto,
        raterId,
      },
      update: {
        rating: createDto.rating,
        comment: createDto.comment,
        skills: createDto.skills,
      },
      include: {
        rater: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        ratedUser: {
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
      throw new ForbiddenException('Not authorized to view project ratings');
    }

    return this.prisma.teamRating.findMany({
      where: { projectId },
      include: {
        rater: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        ratedUser: {
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

  async findByUser(ratedUserId: string) {
    const ratings = await this.prisma.teamRating.findMany({
      where: { ratedUserId },
      include: {
        rater: {
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
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalRatings = ratings.length;
    const avgRating =
      totalRatings > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
        : 0;

    return {
      ratings,
      stats: {
        totalRatings,
        averageRating: avgRating,
      },
    };
  }

  async remove(id: string, userId: string) {
    const rating = await this.prisma.teamRating.findUnique({
      where: { id },
    });

    if (!rating) {
      throw new NotFoundException('Rating not found');
    }

    if (rating.raterId !== userId) {
      throw new ForbiddenException('Not authorized to delete this rating');
    }

    return this.prisma.teamRating.delete({
      where: { id },
    });
  }
}
