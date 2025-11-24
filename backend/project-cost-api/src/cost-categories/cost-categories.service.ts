import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCostCategoryDto } from './dto/create-cost-category.dto';
import { UpdateCostCategoryDto } from './dto/update-cost-category.dto';

@Injectable()
export class CostCategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDto: CreateCostCategoryDto) {
    const existing = await this.prisma.costCategory.findUnique({
      where: {
        name_userId: {
          name: createDto.name,
          userId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Category with this name already exists');
    }

    return this.prisma.costCategory.create({
      data: {
        ...createDto,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.costCategory.findMany({
      where: {
        OR: [{ userId }, { userId: null }],
      },
      include: {
        _count: {
          select: { costs: true, templates: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, userId: string) {
    const category = await this.prisma.costCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { costs: true, templates: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.userId && category.userId !== userId) {
      throw new ForbiddenException('Not authorized to view this category');
    }

    return category;
  }

  async update(id: string, userId: string, updateDto: UpdateCostCategoryDto) {
    const category = await this.findOne(id, userId);

    if (category.userId !== userId) {
      throw new ForbiddenException('Not authorized to update this category');
    }

    if (updateDto.name && updateDto.name !== category.name) {
      const existing = await this.prisma.costCategory.findUnique({
        where: {
          name_userId: {
            name: updateDto.name,
            userId,
          },
        },
      });

      if (existing) {
        throw new ConflictException('Category with this name already exists');
      }
    }

    return this.prisma.costCategory.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: string, userId: string) {
    const category = await this.findOne(id, userId);

    if (category.userId !== userId) {
      throw new ForbiddenException('Not authorized to delete this category');
    }

    return this.prisma.costCategory.delete({
      where: { id },
    });
  }
}
