import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateProjectDto,
  UpdateProjectDto,
  AddTeamMemberDto,
  UpdateTeamMemberDto,
  CreateProjectPhaseDto,
  UpdateProjectPhaseDto,
} from './dto';
import { UserRole, ProjectStatus, TeamRole, Prisma } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto, userId: string) {
    const existingProject = await this.prisma.project.findUnique({
      where: { code: createProjectDto.code },
    });

    if (existingProject && !existingProject.deletedAt) {
      throw new ConflictException(
        'A project with this code already exists. Please use a different code.',
      );
    }

    if (
      new Date(createProjectDto.startDate) >= new Date(createProjectDto.endDate)
    ) {
      throw new BadRequestException('End date must be after start date');
    }

    const project = await this.prisma.project.create({
      data: {
        ...createProjectDto,
        totalBudget: new Prisma.Decimal(createProjectDto.totalBudget),
        userId,
        teamMembers: {
          create: {
            userId,
            role: TeamRole.OWNER,
            isActive: true,
          },
        },
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
        teamMembers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                profile: true,
              },
            },
          },
        },
        phases: true,
        _count: {
          select: {
            tasks: true,
            costs: true,
            teamMembers: true,
          },
        },
      },
    });

    return project;
  }

  async findAll(
    userId: string,
    userRole: UserRole,
    page: number = 1,
    limit: number = 10,
    status?: ProjectStatus,
    search?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.ProjectWhereInput = {
      deletedAt: null,
    };

    if (userRole !== UserRole.SUPER_ADMIN && userRole !== UserRole.ADMIN) {
      where.OR = [
        { userId },
        {
          teamMembers: {
            some: {
              userId,
              isActive: true,
            },
          },
        },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { client: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          teamMembers: {
            where: { isActive: true },
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
          phases: {
            orderBy: { order: 'asc' },
          },
          _count: {
            select: {
              tasks: true,
              costs: true,
              teamMembers: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      data: projects,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string, userRole: UserRole) {
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        deletedAt: null,
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
        teamMembers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                profile: true,
              },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
        phases: {
          orderBy: { order: 'asc' },
          include: {
            _count: {
              select: {
                tasks: true,
                costs: true,
              },
            },
          },
        },
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
        costs: {
          include: {
            category: true,
          },
          orderBy: { dateIncurred: 'desc' },
        },
        _count: {
          select: {
            tasks: true,
            costs: true,
            teamMembers: true,
            discussions: true,
            attachments: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (userRole !== UserRole.SUPER_ADMIN && userRole !== UserRole.ADMIN) {
      const isMember = project.teamMembers.some(
        (member) => member.userId === userId && member.isActive,
      );
      const isOwner = project.userId === userId;

      if (!isMember && !isOwner) {
        throw new ForbiddenException('You do not have access to this project');
      }
    }

    return project;
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    userId: string,
    userRole: UserRole,
  ) {
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        teamMembers: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const canUpdate = this.canManageProject(project, userId, userRole);
    if (!canUpdate) {
      throw new ForbiddenException(
        'You do not have permission to update this project',
      );
    }

    if (updateProjectDto.code && updateProjectDto.code !== project.code) {
      const existingProject = await this.prisma.project.findUnique({
        where: { code: updateProjectDto.code },
      });

      if (existingProject && !existingProject.deletedAt) {
        throw new ConflictException('A project with this code already exists');
      }
    }

    if (
      updateProjectDto.startDate &&
      updateProjectDto.endDate &&
      new Date(updateProjectDto.startDate) >= new Date(updateProjectDto.endDate)
    ) {
      throw new BadRequestException('End date must be after start date');
    }

    const updateData: Prisma.ProjectUpdateInput = { ...updateProjectDto };
    if (updateProjectDto.totalBudget !== undefined) {
      updateData.totalBudget = new Prisma.Decimal(updateProjectDto.totalBudget);
    }
    if (updateProjectDto.actualCost !== undefined) {
      updateData.actualCost = new Prisma.Decimal(updateProjectDto.actualCost);
    }

    const updatedProject = await this.prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        teamMembers: {
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
        phases: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            tasks: true,
            costs: true,
            teamMembers: true,
          },
        },
      },
    });

    return updatedProject;
  }

  async remove(id: string, userId: string, userRole: UserRole) {
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (
      project.userId !== userId &&
      userRole !== UserRole.SUPER_ADMIN &&
      userRole !== UserRole.ADMIN
    ) {
      throw new ForbiddenException(
        'Only the project owner or administrators can delete this project',
      );
    }

    await this.prisma.project.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: ProjectStatus.ARCHIVED,
      },
    });

    return { message: 'Project deleted successfully' };
  }

  async addTeamMember(
    projectId: string,
    addTeamMemberDto: AddTeamMemberDto,
    currentUserId: string,
    userRole: UserRole,
  ) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
      },
      include: {
        teamMembers: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const canManage = this.canManageProject(project, currentUserId, userRole);
    if (!canManage) {
      throw new ForbiddenException(
        'You do not have permission to manage team members',
      );
    }

    const userExists = await this.prisma.user.findFirst({
      where: {
        id: addTeamMemberDto.userId,
        deletedAt: null,
        isActive: true,
      },
    });

    if (!userExists) {
      throw new NotFoundException('User not found or inactive');
    }

    const existingMember = await this.prisma.teamMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: addTeamMemberDto.userId,
        },
      },
    });

    if (existingMember && existingMember.isActive) {
      throw new ConflictException('User is already a member of this project');
    }

    if (existingMember && !existingMember.isActive) {
      const updatedMember = await this.prisma.teamMember.update({
        where: { id: existingMember.id },
        data: {
          isActive: true,
          role: addTeamMemberDto.role || existingMember.role,
          permissions:
            addTeamMemberDto.permissions || existingMember.permissions,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              profile: true,
            },
          },
        },
      });

      return updatedMember;
    }

    const teamMember = await this.prisma.teamMember.create({
      data: {
        projectId,
        userId: addTeamMemberDto.userId,
        role: addTeamMemberDto.role || TeamRole.MEMBER,
        permissions: addTeamMemberDto.permissions,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            profile: true,
          },
        },
      },
    });

    return teamMember;
  }

  async getTeamMembers(projectId: string, userId: string, userRole: UserRole) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
      },
      include: {
        teamMembers: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (userRole !== UserRole.SUPER_ADMIN && userRole !== UserRole.ADMIN) {
      const isMember = project.teamMembers.some(
        (member) => member.userId === userId && member.isActive,
      );
      const isOwner = project.userId === userId;

      if (!isMember && !isOwner) {
        throw new ForbiddenException('You do not have access to this project');
      }
    }

    const teamMembers = await this.prisma.teamMember.findMany({
      where: {
        projectId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            profile: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });

    return teamMembers;
  }

  async updateTeamMember(
    projectId: string,
    memberId: string,
    updateTeamMemberDto: UpdateTeamMemberDto,
    currentUserId: string,
    userRole: UserRole,
  ) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
      },
      include: {
        teamMembers: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const canManage = this.canManageProject(project, currentUserId, userRole);
    if (!canManage) {
      throw new ForbiddenException(
        'You do not have permission to manage team members',
      );
    }

    const teamMember = await this.prisma.teamMember.findUnique({
      where: { id: memberId },
    });

    if (!teamMember || teamMember.projectId !== projectId) {
      throw new NotFoundException('Team member not found in this project');
    }

    if (teamMember.role === TeamRole.OWNER) {
      throw new ForbiddenException('Cannot modify the project owner');
    }

    const updatedMember = await this.prisma.teamMember.update({
      where: { id: memberId },
      data: updateTeamMemberDto,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            profile: true,
          },
        },
      },
    });

    return updatedMember;
  }

  async removeTeamMember(
    projectId: string,
    memberId: string,
    currentUserId: string,
    userRole: UserRole,
  ) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
      },
      include: {
        teamMembers: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const canManage = this.canManageProject(project, currentUserId, userRole);
    if (!canManage) {
      throw new ForbiddenException(
        'You do not have permission to manage team members',
      );
    }

    const teamMember = await this.prisma.teamMember.findUnique({
      where: { id: memberId },
    });

    if (!teamMember || teamMember.projectId !== projectId) {
      throw new NotFoundException('Team member not found in this project');
    }

    if (teamMember.role === TeamRole.OWNER) {
      throw new ForbiddenException('Cannot remove the project owner');
    }

    await this.prisma.teamMember.update({
      where: { id: memberId },
      data: { isActive: false },
    });

    return { message: 'Team member removed successfully' };
  }

  async createPhase(
    projectId: string,
    createPhaseDto: CreateProjectPhaseDto,
    userId: string,
    userRole: UserRole,
  ) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
      },
      include: {
        teamMembers: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const canManage = this.canManageProject(project, userId, userRole);
    if (!canManage) {
      throw new ForbiddenException(
        'You do not have permission to manage project phases',
      );
    }

    if (
      new Date(createPhaseDto.startDate) >= new Date(createPhaseDto.endDate)
    ) {
      throw new BadRequestException('Phase end date must be after start date');
    }

    const phase = await this.prisma.projectPhase.create({
      data: {
        ...createPhaseDto,
        budget: new Prisma.Decimal(createPhaseDto.budget),
        projectId,
      },
      include: {
        _count: {
          select: {
            tasks: true,
            costs: true,
          },
        },
      },
    });

    return phase;
  }

  async getPhases(projectId: string, userId: string, userRole: UserRole) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
      },
      include: {
        teamMembers: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (userRole !== UserRole.SUPER_ADMIN && userRole !== UserRole.ADMIN) {
      const isMember = project.teamMembers.some(
        (member) => member.userId === userId && member.isActive,
      );
      const isOwner = project.userId === userId;

      if (!isMember && !isOwner) {
        throw new ForbiddenException('You do not have access to this project');
      }
    }

    const phases = await this.prisma.projectPhase.findMany({
      where: {
        projectId,
      },
      include: {
        _count: {
          select: {
            tasks: true,
            costs: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    });

    return phases;
  }

  async updatePhase(
    projectId: string,
    phaseId: string,
    updatePhaseDto: UpdateProjectPhaseDto,
    userId: string,
    userRole: UserRole,
  ) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
      },
      include: {
        teamMembers: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const canManage = this.canManageProject(project, userId, userRole);
    if (!canManage) {
      throw new ForbiddenException(
        'You do not have permission to manage project phases',
      );
    }

    const phase = await this.prisma.projectPhase.findUnique({
      where: { id: phaseId },
    });

    if (!phase || phase.projectId !== projectId) {
      throw new NotFoundException('Phase not found in this project');
    }

    if (
      updatePhaseDto.startDate &&
      updatePhaseDto.endDate &&
      new Date(updatePhaseDto.startDate) >= new Date(updatePhaseDto.endDate)
    ) {
      throw new BadRequestException('Phase end date must be after start date');
    }

    const updateData: Prisma.ProjectPhaseUpdateInput = { ...updatePhaseDto };
    if (updatePhaseDto.budget !== undefined) {
      updateData.budget = new Prisma.Decimal(updatePhaseDto.budget);
    }

    const updatedPhase = await this.prisma.projectPhase.update({
      where: { id: phaseId },
      data: updateData,
      include: {
        _count: {
          select: {
            tasks: true,
            costs: true,
          },
        },
      },
    });

    return updatedPhase;
  }

  async deletePhase(
    projectId: string,
    phaseId: string,
    userId: string,
    userRole: UserRole,
  ) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
      },
      include: {
        teamMembers: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const canManage = this.canManageProject(project, userId, userRole);
    if (!canManage) {
      throw new ForbiddenException(
        'You do not have permission to manage project phases',
      );
    }

    const phase = await this.prisma.projectPhase.findUnique({
      where: { id: phaseId },
      include: {
        _count: {
          select: {
            tasks: true,
            costs: true,
          },
        },
      },
    });

    if (!phase || phase.projectId !== projectId) {
      throw new NotFoundException('Phase not found in this project');
    }

    if (phase._count.tasks > 0 || phase._count.costs > 0) {
      throw new BadRequestException(
        'Cannot delete phase with existing tasks or costs. Please reassign or delete them first.',
      );
    }

    await this.prisma.projectPhase.delete({
      where: { id: phaseId },
    });

    return { message: 'Phase deleted successfully' };
  }

  private canManageProject(
    project: {
      userId: string;
      teamMembers?: Array<{
        userId: string;
        isActive: boolean;
        role: TeamRole;
      }>;
    },
    userId: string,
    userRole: UserRole,
  ): boolean {
    if (userRole === UserRole.SUPER_ADMIN || userRole === UserRole.ADMIN) {
      return true;
    }

    if (project.userId === userId) {
      return true;
    }

    const member = project.teamMembers?.find(
      (tm) => tm.userId === userId && tm.isActive,
    );

    return (
      member !== undefined &&
      (member.role === TeamRole.OWNER ||
        member.role === TeamRole.MANAGER ||
        member.role === TeamRole.LEAD)
    );
  }
}
