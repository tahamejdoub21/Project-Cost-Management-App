import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateTaskCommentDto {
  @IsNotEmpty()
  @IsString()
  content: string;
}
