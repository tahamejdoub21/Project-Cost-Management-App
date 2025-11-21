// src/app.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getHello(): Promise<string> {
    try {
      // Simple database connection test
      await this.prisma.$queryRaw`SELECT 1`;
      const userCount = await this.prisma.user.count();
      return `Project Cost Management API is running! Database connected successfully. Users: ${userCount}`;
    } catch (error) {
      console.error('Database connection error:', error);
      return 'Project Cost Management API is running! Database connection failed.';
    }
  }
}
