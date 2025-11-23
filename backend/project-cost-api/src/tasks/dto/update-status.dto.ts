import { IsEnum, IsNotEmpty } from 'class-validator';
import { TaskStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStatusDto {
  @ApiProperty({ enum: TaskStatus, description: 'New task status' })
  @IsEnum(TaskStatus)
  @IsNotEmpty()
  status: TaskStatus;
}
