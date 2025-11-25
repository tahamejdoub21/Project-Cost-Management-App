import { IsNotEmpty, IsString, IsOptional, IsEnum, IsArray } from 'class-validator';

enum MessageType {
  TEXT = 'TEXT',
  FILE = 'FILE',
  SYSTEM = 'SYSTEM',
}

export class CreateChatMessageDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  discussionId?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsEnum(MessageType)
  messageType?: MessageType;

  @IsOptional()
  attachments?: any;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentions?: string[];
}
