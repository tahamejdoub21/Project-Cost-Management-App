import { IsString, IsEnum, IsOptional } from 'class-validator';
import { TeamRole } from '@prisma/client';

export class AddTeamMemberDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsEnum(TeamRole, { message: 'Invalid team role' })
  role?: TeamRole;

  @IsOptional()
  permissions?: any;
}
