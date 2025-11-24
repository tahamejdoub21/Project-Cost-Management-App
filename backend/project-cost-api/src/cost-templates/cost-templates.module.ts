import { Module } from '@nestjs/common';
import { CostTemplatesService } from './cost-templates.service';
import { CostTemplatesController } from './cost-templates.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CostTemplatesController],
  providers: [CostTemplatesService],
  exports: [CostTemplatesService],
})
export class CostTemplatesModule {}
