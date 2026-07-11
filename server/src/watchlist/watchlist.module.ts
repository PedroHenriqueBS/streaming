import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { WatchlistController } from './watchlist.controller';
import { WatchlistService } from './watchlist.service';

@Module({
  imports: [CatalogModule, ProfilesModule],
  controllers: [WatchlistController],
  providers: [WatchlistService],
})
export class WatchlistModule {}
