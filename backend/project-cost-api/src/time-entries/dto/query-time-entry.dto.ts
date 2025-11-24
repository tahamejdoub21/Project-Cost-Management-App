import { IsOptional, IsString, IsDateString, IsBoolean } from 'class-validator';

export class QueryTimeEntryDto {
  @IsOptional()
  @IsString()
  taskId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  billable?: boolean;
}
