import { IsOptional, IsString } from 'class-validator';

export class UpdateTaskAttachmentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
