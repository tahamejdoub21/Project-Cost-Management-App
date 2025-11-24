import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserProfilesService {
  constructor(private prisma: PrismaService) {}

  async findOne(userId: string) {
    let profile = await this.prisma.userProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    if (!profile) {
      profile = await this.prisma.userProfile.create({
        data: { userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              role: true,
            },
          },
        },
      });
    }

    return profile;
  }

  async update(userId: string, updateDto: UpdateUserProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      profile = await this.prisma.userProfile.create({
        data: { userId },
      });
    }

    return this.prisma.userProfile.update({
      where: { userId },
      data: {
        ...updateDto,
        hourlyRate: updateDto.hourlyRate
          ? new Prisma.Decimal(updateDto.hourlyRate)
          : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
    });
  }
}
