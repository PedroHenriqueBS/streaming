import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RecordHistoryDto } from './dto/record-history.dto';
import { HistoryService } from './history.service';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  findRecent(@CurrentUser() user: AuthenticatedUser, @Query('profileId') profileId: string) {
    return this.historyService.findRecent(user.userId, profileId);
  }

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  record(@CurrentUser() user: AuthenticatedUser, @Body() dto: RecordHistoryDto): Promise<void> {
    return this.historyService.record(user.userId, dto);
  }
}
