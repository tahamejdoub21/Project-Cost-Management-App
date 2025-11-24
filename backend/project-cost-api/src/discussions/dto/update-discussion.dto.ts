import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateDiscussionDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;
}
