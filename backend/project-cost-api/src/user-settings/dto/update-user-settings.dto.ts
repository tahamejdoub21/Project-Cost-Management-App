import { IsOptional, IsString, IsEnum } from 'class-validator';

enum EmailFrequency {
  REALTIME = 'REALTIME',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  NEVER = 'NEVER',
}

export class UpdateUserSettingsDto {
  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  dateFormat?: string;

  @IsOptional()
  @IsString()
  theme?: string;

  @IsOptional()
  notifications?: any;

  @IsOptional()
  @IsEnum(EmailFrequency)
  emailFrequency?: EmailFrequency;
}
