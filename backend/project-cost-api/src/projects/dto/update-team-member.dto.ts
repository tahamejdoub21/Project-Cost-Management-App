import { IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { TeamRole } from '@prisma/client';

export class UpdateTeamMemberDto {
  @IsOptional()
  @IsEnum(TeamRole, { message: 'Invalid team role' })
  role?: TeamRole;

  @IsOptional()
  permissions?: any;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
