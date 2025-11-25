import { IsOptional, IsString, IsArray } from 'class-validator';

export class UpdateChatMessageDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentions?: string[];
}
