import { Module } from '@nestjs/common';
import { CostCategoriesService } from './cost-categories.service';
import { CostCategoriesController } from './cost-categories.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CostCategoriesController],
  providers: [CostCategoriesService],
  exports: [CostCategoriesService],
})
export class CostCategoriesModule {}
