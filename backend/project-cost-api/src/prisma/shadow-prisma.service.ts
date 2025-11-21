// src/prisma/shadow-prisma.service.ts
import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class ShadowPrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(ShadowPrismaService.name);
  private pool: Pool;

  constructor(private configService: ConfigService) {
    const shadowDatabaseUrl = configService.get<string>('SHADOW_DATABASE_URL');
    if (!shadowDatabaseUrl) {
      throw new Error(
        'SHADOW_DATABASE_URL is not defined in environment variables',
      );
    }

    // Create PostgreSQL connection pool for shadow database
    const pool = new Pool({
      connectionString: shadowDatabaseUrl,
    });

    // Create Prisma adapter for PostgreSQL
    const adapter = new PrismaPg(pool);

    // Initialize PrismaClient with the adapter
    super({
      adapter,
      log:
        configService.get<string>('NODE_ENV') === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
    });

    this.pool = pool;
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to SHADOW PostgreSQL database');
    } catch (error) {
      this.logger.error('Failed to connect to shadow database', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Disconnected from shadow database');
    } catch (error) {
      this.logger.error('Error disconnecting from shadow database', error);
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
