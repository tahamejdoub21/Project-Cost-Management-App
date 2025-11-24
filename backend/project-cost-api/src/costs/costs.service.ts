import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCostDto } from './dto/create-cost.dto';
import { UpdateCostDto } from './dto/update-cost.dto';
import { QueryCostDto } from './dto/query-cost.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CostsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDto: CreateCostDto) {
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
        'Not authorized to add costs to this project',
      );
    }

    if (createDto.phaseId) {
      const phase = await this.prisma.projectPhase.findFirst({
        where: {
          id: createDto.phaseId,
          projectId: createDto.projectId,
        },
      });

      if (!phase) {
        throw new NotFoundException('Phase not found in this project');
      }
    }

    const cost = await this.prisma.cost.create({
      data: {
        ...createDto,
        userId,
        amount: new Prisma.Decimal(createDto.amount),
        unitPrice: new Prisma.Decimal(createDto.unitPrice),
        dateIncurred: new Date(createDto.dateIncurred),
        dueDate: createDto.dueDate ? new Date(createDto.dueDate) : null,
        paidDate: createDto.paidDate ? new Date(createDto.paidDate) : null,
      },
      include: {
        category: true,
        phase: true,
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

    await this.updateProjectActualCost(createDto.projectId);

    return cost;
  }

  async findAll(userId: string, query: QueryCostDto) {
    const where: any = {};

    if (query.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: query.projectId },
        include: { teamMembers: true },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      const isMember = project.teamMembers.some(
        (member) => member.userId === userId && member.isActive,
      );

      if (!isMember && project.userId !== userId) {
        throw new ForbiddenException('Not authorized to view project costs');
      }

      where.projectId = query.projectId;
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.phaseId) {
      where.phaseId = query.phaseId;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.startDate || query.endDate) {
      where.dateIncurred = {};
      if (query.startDate) {
        where.dateIncurred.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.dateIncurred.lte = new Date(query.endDate);
      }
    }

    return this.prisma.cost.findMany({
      where,
      include: {
        category: true,
        phase: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { dateIncurred: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const cost = await this.prisma.cost.findUnique({
      where: { id },
      include: {
        category: true,
        phase: true,
        project: {
          include: {
            teamMembers: true,
          },
        },
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

    if (!cost) {
      throw new NotFoundException('Cost not found');
    }

    const isMember = cost.project.teamMembers.some(
      (member) => member.userId === userId && member.isActive,
    );

    if (cost.project.userId !== userId && !isMember) {
      throw new ForbiddenException('Not authorized to view this cost');
    }

    return cost;
  }

  async update(id: string, userId: string, updateDto: UpdateCostDto) {
    const cost = await this.findOne(id, userId);

    if (cost.userId !== userId) {
      throw new ForbiddenException('Not authorized to update this cost');
    }

    const updated = await this.prisma.cost.update({
      where: { id },
      data: {
        ...updateDto,
        amount: updateDto.amount
          ? new Prisma.Decimal(updateDto.amount)
          : undefined,
        unitPrice: updateDto.unitPrice
          ? new Prisma.Decimal(updateDto.unitPrice)
          : undefined,
        dateIncurred: updateDto.dateIncurred
          ? new Date(updateDto.dateIncurred)
          : undefined,
        dueDate: updateDto.dueDate ? new Date(updateDto.dueDate) : undefined,
        paidDate: updateDto.paidDate ? new Date(updateDto.paidDate) : undefined,
      },
      include: {
        category: true,
        phase: true,
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

    await this.updateProjectActualCost(cost.projectId);

    return updated;
  }

  async remove(id: string, userId: string) {
    const cost = await this.findOne(id, userId);

    if (cost.userId !== userId) {
      throw new ForbiddenException('Not authorized to delete this cost');
    }

    const deleted = await this.prisma.cost.delete({
      where: { id },
    });

    await this.updateProjectActualCost(cost.projectId);

    return deleted;
  }

  private async updateProjectActualCost(projectId: string) {
    const costs = await this.prisma.cost.findMany({
      where: {
        projectId,
        status: { in: ['APPROVED', 'PAID'] },
      },
    });

    const totalCost = costs.reduce((sum, cost) => {
      const amount =
        typeof cost.amount === 'object'
          ? parseFloat(cost.amount.toString())
          : cost.amount;
      return sum + amount;
    }, 0);

    await this.prisma.project.update({
      where: { id: projectId },
      data: { actualCost: new Prisma.Decimal(totalCost) },
    });
  }

  async getProjectCostSummary(projectId: string, userId: string) {
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
      throw new ForbiddenException('Not authorized to view project costs');
    }

    const costs = await this.prisma.cost.findMany({
      where: { projectId },
      include: { category: true },
    });

    const totalBudget = parseFloat(project.totalBudget.toString());
    const actualCost = parseFloat(project.actualCost.toString());

    const byCategory = costs.reduce(
      (acc, cost) => {
        const categoryName = cost.category.name;
        const amount = parseFloat(cost.amount.toString());
        if (!acc[categoryName]) {
          acc[categoryName] = { total: 0, count: 0 };
        }
        acc[categoryName].total += amount;
        acc[categoryName].count += 1;
        return acc;
      },
      {} as Record<string, { total: number; count: number }>,
    );

    const byStatus = costs.reduce(
      (acc, cost) => {
        const amount = parseFloat(cost.amount.toString());
        if (!acc[cost.status]) {
          acc[cost.status] = { total: 0, count: 0 };
        }
        acc[cost.status].total += amount;
        acc[cost.status].count += 1;
        return acc;
      },
      {} as Record<string, { total: number; count: number }>,
    );

    return {
      totalBudget,
      actualCost,
      remaining: totalBudget - actualCost,
      utilizationPercentage: (actualCost / totalBudget) * 100,
      totalCosts: costs.length,
      byCategory,
      byStatus,
    };
  }
}
