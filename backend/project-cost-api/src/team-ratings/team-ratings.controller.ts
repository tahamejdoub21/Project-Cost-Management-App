import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TeamRatingsService } from './team-ratings.service';
import { CreateTeamRatingDto } from './dto/create-team-rating.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('team-ratings')
@UseGuards(JwtAuthGuard)
export class TeamRatingsController {
  constructor(private readonly teamRatingsService: TeamRatingsService) {}

  @Post()
  create(
    @CurrentUser('id') userId: string,
    @Body() createDto: CreateTeamRatingDto,
  ) {
    return this.teamRatingsService.create(userId, createDto);
  }

  @Get('project/:projectId')
  findByProject(
    @Param('projectId') projectId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.teamRatingsService.findByProject(projectId, userId);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.teamRatingsService.findByUser(userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.teamRatingsService.remove(id, userId);
  }
}
