import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CostCategoriesService } from './cost-categories.service';
import { CreateCostCategoryDto } from './dto/create-cost-category.dto';
import { UpdateCostCategoryDto } from './dto/update-cost-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('cost-categories')
@UseGuards(JwtAuthGuard)
export class CostCategoriesController {
  constructor(private readonly costCategoriesService: CostCategoriesService) {}

  @Post()
  create(
    @CurrentUser('id') userId: string,
    @Body() createDto: CreateCostCategoryDto,
  ) {
    return this.costCategoriesService.create(userId, createDto);
  }

  @Get()
  findAll(@CurrentUser('id') userId: string) {
    return this.costCategoriesService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.costCategoriesService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateDto: UpdateCostCategoryDto,
  ) {
    return this.costCategoriesService.update(id, userId, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.costCategoriesService.remove(id, userId);
  }
}
