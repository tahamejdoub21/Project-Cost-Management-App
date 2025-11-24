import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

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
}
