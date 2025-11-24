import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { UserSettingsService } from './user-settings.service';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('user-settings')
@UseGuards(JwtAuthGuard)
export class UserSettingsController {
  constructor(private readonly userSettingsService: UserSettingsService) {}

  @Get('me')
  findMySettings(@CurrentUser('id') userId: string) {
    return this.userSettingsService.findOne(userId);
  }

  @Patch('me')
  updateMySettings(
    @CurrentUser('id') userId: string,
    @Body() updateDto: UpdateUserSettingsDto,
  ) {
    return this.userSettingsService.update(userId, updateDto);
  }
}
