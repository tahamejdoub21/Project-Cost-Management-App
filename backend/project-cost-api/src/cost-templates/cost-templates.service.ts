import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCostTemplateDto } from './dto/create-cost-template.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CostTemplatesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDto: CreateCostTemplateDto) {
    return this.prisma.costTemplate.create({
      data: {
        ...createDto,
        userId,
        amount: new Prisma.Decimal(createDto.amount),
      },
      include: { category: true },
    });
  }

  async findAll(userId: string) {
    return this.prisma.costTemplate.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const template = await this.prisma.costTemplate.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    if (template.userId !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    return template;
  }

  async update(
    id: string,
    userId: string,
    updateDto: Partial<CreateCostTemplateDto>,
  ) {
    await this.findOne(id, userId);

    return this.prisma.costTemplate.update({
      where: { id },
      data: {
        ...updateDto,
        amount: updateDto.amount
          ? new Prisma.Decimal(updateDto.amount)
          : undefined,
      },
      include: { category: true },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.costTemplate.delete({ where: { id } });
  }
}
