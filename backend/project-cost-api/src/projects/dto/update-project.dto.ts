import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectDto } from './create-project.dto';
import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Actual cost must have at most 2 decimal places' },
  )
  @Min(0, { message: 'Actual cost must be greater than or equal to 0' })
  @Type(() => Number)
  actualCost?: number;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Progress must have at most 2 decimal places' },
  )
  @Min(0, { message: 'Progress must be at least 0' })
  @Max(100, { message: 'Progress must not exceed 100' })
  @Type(() => Number)
  progress?: number;
}
