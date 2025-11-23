import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsNumber,
  IsInt,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { PhaseStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateProjectPhaseDto {
  @IsString()
  @MinLength(3, { message: 'Phase name must be at least 3 characters long' })
  @MaxLength(200, { message: 'Phase name must not exceed 200 characters' })
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, {
    message: 'Description must not exceed 1000 characters',
  })
  description?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Budget must have at most 2 decimal places' },
  )
  @Min(0, { message: 'Budget must be greater than or equal to 0' })
  @Type(() => Number)
  budget: number;

  @IsOptional()
  @IsEnum(PhaseStatus, { message: 'Invalid phase status' })
  status?: PhaseStatus;

  @IsInt()
  @Min(0, { message: 'Order must be greater than or equal to 0' })
  @Type(() => Number)
  order: number;
}
