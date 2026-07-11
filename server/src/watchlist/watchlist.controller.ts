import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { ParseMediaTypePipe } from '../catalog/pipes/parse-media-type.pipe';
import type { ApiMediaType } from '../catalog/types/catalog.types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AddWatchlistItemDto } from './dto/add-watchlist-item.dto';
import { WatchlistService } from './watchlist.service';

@Controller('watchlist')
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser, @Query('profileId') profileId: string) {
    return this.watchlistService.findAll(user.userId, profileId);
  }

  @Post()
  add(@CurrentUser() user: AuthenticatedUser, @Body() dto: AddWatchlistItemDto) {
    return this.watchlistService.add(user.userId, dto.profileId, dto.mediaType, dto.tmdbId);
  }

  @Delete(':mediaType/:tmdbId')
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('mediaType', ParseMediaTypePipe) mediaType: ApiMediaType,
    @Param('tmdbId', ParseIntPipe) tmdbId: number,
    @Query('profileId') profileId: string,
  ) {
    return this.watchlistService.remove(user.userId, profileId, mediaType, tmdbId);
  }
}
