import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import {
  CreateProjectDto,
  UpdateProjectDto,
  AddTeamMemberDto,
  UpdateTeamMemberDto,
  CreateProjectPhaseDto,
  UpdateProjectPhaseDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, ProjectStatus } from '@prisma/client';

@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.create(createProjectDto, userId);
  }

  @Get()
  async findAll(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: ProjectStatus,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    return this.projectsService.findAll(
      userId,
      userRole,
      pageNum,
      limitNum,
      status,
      search,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.projectsService.findOne(id, userId, userRole);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.projectsService.update(id, updateProjectDto, userId, userRole);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.projectsService.remove(id, userId, userRole);
  }

  @Post(':id/team-members')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
  @HttpCode(HttpStatus.CREATED)
  async addTeamMember(
    @Param('id') projectId: string,
    @Body() addTeamMemberDto: AddTeamMemberDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.projectsService.addTeamMember(
      projectId,
      addTeamMemberDto,
      userId,
      userRole,
    );
  }

  @Get(':id/team-members')
  async getTeamMembers(
    @Param('id') projectId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.projectsService.getTeamMembers(projectId, userId, userRole);
  }

  @Patch(':id/team-members/:memberId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
  async updateTeamMember(
    @Param('id') projectId: string,
    @Param('memberId') memberId: string,
    @Body() updateTeamMemberDto: UpdateTeamMemberDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.projectsService.updateTeamMember(
      projectId,
      memberId,
      updateTeamMemberDto,
      userId,
      userRole,
    );
  }

  @Delete(':id/team-members/:memberId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
  @HttpCode(HttpStatus.OK)
  async removeTeamMember(
    @Param('id') projectId: string,
    @Param('memberId') memberId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.projectsService.removeTeamMember(
      projectId,
      memberId,
      userId,
      userRole,
    );
  }

  @Post(':id/phases')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
  @HttpCode(HttpStatus.CREATED)
  async createPhase(
    @Param('id') projectId: string,
    @Body() createPhaseDto: CreateProjectPhaseDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.projectsService.createPhase(
      projectId,
      createPhaseDto,
      userId,
      userRole,
    );
  }

  @Get(':id/phases')
  async getPhases(
    @Param('id') projectId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.projectsService.getPhases(projectId, userId, userRole);
  }

  @Patch(':id/phases/:phaseId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
  async updatePhase(
    @Param('id') projectId: string,
    @Param('phaseId') phaseId: string,
    @Body() updatePhaseDto: UpdateProjectPhaseDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.projectsService.updatePhase(
      projectId,
      phaseId,
      updatePhaseDto,
      userId,
      userRole,
    );
  }

  @Delete(':id/phases/:phaseId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
  @HttpCode(HttpStatus.OK)
  async deletePhase(
    @Param('id') projectId: string,
    @Param('phaseId') phaseId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    return this.projectsService.deletePhase(
      projectId,
      phaseId,
      userId,
      userRole,
    );
  }
}
