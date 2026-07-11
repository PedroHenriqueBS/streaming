import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { TmdbClient } from './tmdb/tmdb-client';

@Module({
  imports: [CacheModule.register()],
  controllers: [CatalogController],
  providers: [CatalogService, TmdbClient],
  exports: [CatalogService],
})
export class CatalogModule {}
