import { Module } from '@nestjs/common';
import { TeamRatingsService } from './team-ratings.service';
import { TeamRatingsController } from './team-ratings.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TeamRatingsController],
  providers: [TeamRatingsService],
  exports: [TeamRatingsService],
})
export class TeamRatingsModule {}
