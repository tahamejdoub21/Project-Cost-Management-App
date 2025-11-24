import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { UserProfilesService } from './user-profiles.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('user-profiles')
@UseGuards(JwtAuthGuard)
export class UserProfilesController {
  constructor(private readonly userProfilesService: UserProfilesService) {}

  @Get('me')
  findMyProfile(@CurrentUser('id') userId: string) {
    return this.userProfilesService.findOne(userId);
  }

  @Get(':userId')
  findOne(@Param('userId') userId: string) {
    return this.userProfilesService.findOne(userId);
  }

  @Patch('me')
  updateMyProfile(
    @CurrentUser('id') userId: string,
    @Body() updateDto: UpdateUserProfileDto,
  ) {
    return this.userProfilesService.update(userId, updateDto);
  }
}
