import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { ParseMediaTypePipe } from './pipes/parse-media-type.pipe';
import type { ApiMediaType } from './types/catalog.types';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('home')
  getHome() {
    return this.catalogService.getHome();
  }

  @Get('movies')
  getMovies() {
    return this.catalogService.getMovies();
  }

  @Get('series')
  getSeries() {
    return this.catalogService.getSeries();
  }

  @Get('animation')
  getAnimation() {
    return this.catalogService.getAnimation();
  }

  @Get('search')
  search(@Query('query') query = '') {
    return this.catalogService.search(query);
  }

  @Get('tv/:tmdbId/seasons/:seasonNumber')
  getSeason(
    @Param('tmdbId', ParseIntPipe) tmdbId: number,
    @Param('seasonNumber', ParseIntPipe) seasonNumber: number,
  ) {
    return this.catalogService.getSeason(tmdbId, seasonNumber);
  }

  @Get(':mediaType/:tmdbId')
  getDetail(
    @Param('mediaType', ParseMediaTypePipe) mediaType: ApiMediaType,
    @Param('tmdbId', ParseIntPipe) tmdbId: number,
  ) {
    return this.catalogService.getDetail(mediaType, tmdbId);
  }
}
