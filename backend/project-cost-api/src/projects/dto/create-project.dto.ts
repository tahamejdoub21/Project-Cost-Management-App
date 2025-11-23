import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsNumber,
  IsArray,
  MinLength,
  MaxLength,
  Min,
  Matches,
  IsHexColor,
} from 'class-validator';
import { ProjectStatus, ProjectPriority } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateProjectDto {
  @IsString()
  @MinLength(3, { message: 'Project name must be at least 3 characters long' })
  @MaxLength(200, { message: 'Project name must not exceed 200 characters' })
  name: string;

  @IsString()
  @MinLength(2, { message: 'Project code must be at least 2 characters long' })
  @MaxLength(20, { message: 'Project code must not exceed 20 characters' })
  @Matches(/^[A-Z0-9-_]+$/, {
    message:
      'Project code must contain only uppercase letters, numbers, hyphens, and underscores',
  })
  code: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, {
    message: 'Description must not exceed 2000 characters',
  })
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Client name must not exceed 200 characters' })
  client?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsEnum(ProjectStatus, { message: 'Invalid project status' })
  status?: ProjectStatus;

  @IsOptional()
  @IsEnum(ProjectPriority, { message: 'Invalid project priority' })
  priority?: ProjectPriority;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Total budget must have at most 2 decimal places' },
  )
  @Min(0, { message: 'Total budget must be greater than or equal to 0' })
  @Type(() => Number)
  totalBudget: number;

  @IsOptional()
  @IsHexColor({ message: 'Color must be a valid hex color code' })
  color?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  metadata?: any;
}
