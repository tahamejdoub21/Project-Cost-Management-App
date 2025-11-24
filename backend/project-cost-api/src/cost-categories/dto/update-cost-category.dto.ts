import { PartialType } from '@nestjs/mapped-types';
import { CreateCostCategoryDto } from './create-cost-category.dto';

export class UpdateCostCategoryDto extends PartialType(CreateCostCategoryDto) {}
