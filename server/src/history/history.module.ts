import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { HistoryController } from './history.controller';
import { HistoryService } from './history.service';

@Module({
  imports: [CatalogModule, ProfilesModule],
  controllers: [HistoryController],
  providers: [HistoryService],
})
export class HistoryModule {}
