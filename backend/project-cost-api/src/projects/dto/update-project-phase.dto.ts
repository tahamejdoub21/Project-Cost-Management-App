import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectPhaseDto } from './create-project-phase.dto';
import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProjectPhaseDto extends PartialType(CreateProjectPhaseDto) {
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
