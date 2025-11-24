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
import { CostTemplatesService } from './cost-templates.service';
import { CreateCostTemplateDto } from './dto/create-cost-template.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('cost-templates')
@UseGuards(JwtAuthGuard)
export class CostTemplatesController {
  constructor(private readonly costTemplatesService: CostTemplatesService) {}

  @Post()
  create(
    @CurrentUser('id') userId: string,
    @Body() createDto: CreateCostTemplateDto,
  ) {
    return this.costTemplatesService.create(userId, createDto);
  }

  @Get()
  findAll(@CurrentUser('id') userId: string) {
    return this.costTemplatesService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.costTemplatesService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateDto: Partial<CreateCostTemplateDto>,
  ) {
    return this.costTemplatesService.update(id, userId, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.costTemplatesService.remove(id, userId);
  }
}
