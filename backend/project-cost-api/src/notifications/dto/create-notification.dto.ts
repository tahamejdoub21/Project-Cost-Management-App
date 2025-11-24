import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';

export enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_COMMENT = 'TASK_COMMENT',
  PROJECT_INVITE = 'PROJECT_INVITE',
  PROJECT_UPDATE = 'PROJECT_UPDATE',
  DEADLINE_REMINDER = 'DEADLINE_REMINDER',
  TEAM_MESSAGE = 'TEAM_MESSAGE',
  SYSTEM = 'SYSTEM',
}

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsOptional()
  data?: any;

  @IsOptional()
  @IsString()
  relatedEntity?: string;

  @IsOptional()
  @IsString()
  relatedEntityId?: string;
}
