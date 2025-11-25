import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDiscussionDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsNotEmpty()
  @IsString()
  projectId: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isPinned?: boolean;
}
