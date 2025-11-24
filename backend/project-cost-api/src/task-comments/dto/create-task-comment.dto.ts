import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateTaskCommentDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsString()
  taskId: string;

  @IsOptional()
  @IsString()
  parentId?: string;
}
