import { Body, Controller, Get, Patch } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { UpdateAccountDto } from './dto/update-account.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { UsersService } from './users.service';

@Controller('users/me')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getAccount(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getAccount(user.userId);
  }

  @Patch()
  updateAccount(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateAccountDto) {
    return this.usersService.updateAccount(user.userId, dto);
  }

  @Patch('preferences')
  updatePreferences(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdatePreferencesDto) {
    return this.usersService.updatePreferences(user.userId, dto);
  }

  @Patch('plan')
  updatePlan(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdatePlanDto) {
    return this.usersService.updatePlan(user.userId, dto);
  }
}
