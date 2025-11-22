import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { UserRole, Prisma } from '@prisma/client';
import { UploadService } from '../uploads/upload.service';

@Injectable()
export class UsersService {
  private readonly SALT_ROUNDS = 12;

  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  async create(createUserDto: CreateUserDto, creatorRole: UserRole) {
    if (
      createUserDto.role &&
      !this.canAssignRole(creatorRole, createUserDto.role)
    ) {
      throw new ForbiddenException(
        `You don't have permission to create users with role: ${createUserDto.role}`,
      );
    }

    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: createUserDto.email,
      },
    });

    if (existingUser && existingUser.deletedAt === null) {
      throw new ConflictException('User with this email already exists');
    }

    if (existingUser && existingUser.deletedAt !== null) {
      const hashedPassword = await bcrypt.hash(
        createUserDto.password,
        this.SALT_ROUNDS,
      );

      const restoredUser = await this.prisma.user.update({
        where: { id: existingUser.id },
        data: {
          password: hashedPassword,
          name: createUserDto.name,
          role: createUserDto.role || UserRole.USER,
          isActive: createUserDto.isActive ?? true,
          deletedAt: null,
          emailVerified: false,
          avatar: null,
          profile: {
            upsert: {
              create: {
                position: createUserDto.position,
                department: createUserDto.department,
              },
              update: {
                position: createUserDto.position,
                department: createUserDto.department,
              },
            },
          },
          userSettings: {
            upsert: {
              create: {},
              update: {},
            },
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          profile: {
            select: {
              position: true,
              department: true,
              bio: true,
              phone: true,
              location: true,
              skills: true,
              experience: true,
              hourlyRate: true,
              website: true,
              socialLinks: true,
            },
          },
        },
      });

      return restoredUser;
    }

    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      this.SALT_ROUNDS,
    );

    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        name: createUserDto.name,
        role: createUserDto.role || UserRole.USER,
        isActive: createUserDto.isActive ?? true,
        profile:
          createUserDto.position || createUserDto.department
            ? {
                create: {
                  position: createUserDto.position,
                  department: createUserDto.department,
                },
              }
            : undefined,
        userSettings: {
          create: {},
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            position: true,
            department: true,
            bio: true,
            phone: true,
            location: true,
            skills: true,
            experience: true,
            hourlyRate: true,
            website: true,
            socialLinks: true,
          },
        },
      },
    });

    return user;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    role?: UserRole,
    isActive?: boolean,
    search?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
    };

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          isActive: true,
          emailVerified: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          profile: {
            select: {
              position: true,
              department: true,
              bio: true,
              phone: true,
              location: true,
              skills: true,
              experience: true,
              hourlyRate: true,
              website: true,
              socialLinks: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        isActive: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            bio: true,
            position: true,
            department: true,
            skills: true,
            experience: true,
            hourlyRate: true,
            phone: true,
            location: true,
            website: true,
            socialLinks: true,
          },
        },
        userSettings: {
          select: {
            language: true,
            currency: true,
            timezone: true,
            dateFormat: true,
            theme: true,
            emailFrequency: true,
          },
        },
        _count: {
          select: {
            projects: true,
            tasks: true,
            teamMembers: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUserId: string,
    currentUserRole: UserRole,
  ) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (
      updateUserDto.role &&
      !this.canModifyRole(currentUserRole, user.role, updateUserDto.role)
    ) {
      throw new ForbiddenException(
        `You don't have permission to change this user's role`,
      );
    }

    if (id !== currentUserId && currentUserRole === UserRole.USER) {
      throw new ForbiddenException('You can only update your own profile');
    }

    const updateData: Prisma.UserUpdateInput = {};

    if (updateUserDto.name) updateData.name = updateUserDto.name;
    if (updateUserDto.role) updateData.role = updateUserDto.role;
    if (updateUserDto.isActive !== undefined)
      updateData.isActive = updateUserDto.isActive;

    const profileCreateData: Prisma.UserProfileCreateWithoutUserInput = {};
    const profileUpdateData: Prisma.UserProfileUpdateWithoutUserInput = {};

    if (updateUserDto.position !== undefined) {
      profileCreateData.position = updateUserDto.position;
      profileUpdateData.position = updateUserDto.position;
    }
    if (updateUserDto.department !== undefined) {
      profileCreateData.department = updateUserDto.department;
      profileUpdateData.department = updateUserDto.department;
    }
    if (updateUserDto.bio !== undefined) {
      profileCreateData.bio = updateUserDto.bio;
      profileUpdateData.bio = updateUserDto.bio;
    }
    if (updateUserDto.phone !== undefined) {
      profileCreateData.phone = updateUserDto.phone;
      profileUpdateData.phone = updateUserDto.phone;
    }
    if (updateUserDto.location !== undefined) {
      profileCreateData.location = updateUserDto.location;
      profileUpdateData.location = updateUserDto.location;
    }
    if (updateUserDto.skills !== undefined) {
      profileCreateData.skills = updateUserDto.skills;
      profileUpdateData.skills = updateUserDto.skills;
    }
    if (updateUserDto.experience !== undefined) {
      profileCreateData.experience = updateUserDto.experience;
      profileUpdateData.experience = updateUserDto.experience;
    }
    if (updateUserDto.hourlyRate !== undefined) {
      profileCreateData.hourlyRate = updateUserDto.hourlyRate;
      profileUpdateData.hourlyRate = updateUserDto.hourlyRate;
    }
    if (updateUserDto.website !== undefined) {
      profileCreateData.website = updateUserDto.website;
      profileUpdateData.website = updateUserDto.website;
    }
    if (updateUserDto.socialLinks !== undefined) {
      profileCreateData.socialLinks = updateUserDto.socialLinks;
      profileUpdateData.socialLinks = updateUserDto.socialLinks;
    }

    if (Object.keys(profileCreateData).length > 0) {
      updateData.profile = {
        upsert: {
          create: profileCreateData,
          update: profileUpdateData,
        },
      };
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        isActive: true,
        emailVerified: true,
        updatedAt: true,
        profile: {
          select: {
            position: true,
            department: true,
            bio: true,
            phone: true,
            location: true,
            skills: true,
            experience: true,
            hourlyRate: true,
            website: true,
            socialLinks: true,
          },
        },
      },
    });

    return updatedUser;
  }

  async updateAvatar(userId: string, file: Express.Multer.File) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (user.avatar) {
      await this.uploadService.deleteFile(user.avatar);
    }

    const avatarPath = `uploads/avatars/${file.filename}`;

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarPath },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
      },
    });

    return {
      ...updatedUser,
      avatarUrl: this.uploadService.getFileUrl(avatarPath),
    };
  }

  async deleteAvatar(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (user.avatar) {
      await this.uploadService.deleteFile(user.avatar);

      await this.prisma.user.update({
        where: { id: userId },
        data: { avatar: null },
      });
    }

    return { message: 'Avatar deleted successfully' };
  }

  async remove(id: string, currentUserRole: UserRole) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (!this.canDeleteUser(currentUserRole, user.role)) {
      throw new ForbiddenException(
        `You don't have permission to delete this user`,
      );
    }

    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'User deleted successfully' };
  }

  async deactivate(id: string, currentUserRole: UserRole) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (!this.canModifyUser(currentUserRole, user.role)) {
      throw new ForbiddenException(
        `You don't have permission to deactivate this user`,
      );
    }

    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'User deactivated successfully' };
  }

  async activate(id: string, currentUserRole: UserRole) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (!this.canModifyUser(currentUserRole, user.role)) {
      throw new ForbiddenException(
        `You don't have permission to activate this user`,
      );
    }

    await this.prisma.user.update({
      where: { id },
      data: { isActive: true },
    });

    return { message: 'User activated successfully' };
  }

  private canAssignRole(creatorRole: UserRole, targetRole: UserRole): boolean {
    const roleHierarchy = {
      [UserRole.SUPER_ADMIN]: 5,
      [UserRole.ADMIN]: 4,
      [UserRole.MANAGER]: 3,
      [UserRole.USER]: 2,
      [UserRole.VIEWER]: 1,
    };

    return roleHierarchy[creatorRole] > roleHierarchy[targetRole];
  }

  private canModifyRole(
    currentRole: UserRole,
    userCurrentRole: UserRole,
    newRole: UserRole,
  ): boolean {
    const roleHierarchy = {
      [UserRole.SUPER_ADMIN]: 5,
      [UserRole.ADMIN]: 4,
      [UserRole.MANAGER]: 3,
      [UserRole.USER]: 2,
      [UserRole.VIEWER]: 1,
    };

    return (
      roleHierarchy[currentRole] > roleHierarchy[userCurrentRole] &&
      roleHierarchy[currentRole] > roleHierarchy[newRole]
    );
  }

  private canDeleteUser(currentRole: UserRole, targetRole: UserRole): boolean {
    const roleHierarchy = {
      [UserRole.SUPER_ADMIN]: 5,
      [UserRole.ADMIN]: 4,
      [UserRole.MANAGER]: 3,
      [UserRole.USER]: 2,
      [UserRole.VIEWER]: 1,
    };

    return roleHierarchy[currentRole] > roleHierarchy[targetRole];
  }

  private canModifyUser(currentRole: UserRole, targetRole: UserRole): boolean {
    const roleHierarchy = {
      [UserRole.SUPER_ADMIN]: 5,
      [UserRole.ADMIN]: 4,
      [UserRole.MANAGER]: 3,
      [UserRole.USER]: 2,
      [UserRole.VIEWER]: 1,
    };

    return roleHierarchy[currentRole] >= roleHierarchy[targetRole];
  }
}
