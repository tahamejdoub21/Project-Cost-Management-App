import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CostsService } from './costs.service';
import { CreateCostDto } from './dto/create-cost.dto';
import { UpdateCostDto } from './dto/update-cost.dto';
import { QueryCostDto } from './dto/query-cost.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('costs')
@UseGuards(JwtAuthGuard)
export class CostsController {
  constructor(private readonly costsService: CostsService) {}

  @Post()
  create(@CurrentUser('id') userId: string, @Body() createDto: CreateCostDto) {
    return this.costsService.create(userId, createDto);
  }

  @Get()
  findAll(@CurrentUser('id') userId: string, @Query() query: QueryCostDto) {
    return this.costsService.findAll(userId, query);
  }

  @Get('project/:projectId/summary')
  getProjectCostSummary(
    @Param('projectId') projectId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.costsService.getProjectCostSummary(projectId, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.costsService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateDto: UpdateCostDto,
  ) {
    return this.costsService.update(id, userId, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.costsService.remove(id, userId);
  }
}
