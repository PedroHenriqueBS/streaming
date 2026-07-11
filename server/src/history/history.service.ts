import { Injectable } from '@nestjs/common';
import { CatalogService } from '../catalog/catalog.service';
import { TitleSummary } from '../catalog/types/catalog.types';
import { PrismaService } from '../prisma/prisma.service';
import { ProfilesService } from '../profiles/profiles.service';
import { RecordHistoryDto } from './dto/record-history.dto';

const HISTORY_PAGE_SIZE = 20;

export interface HistoryEntry {
  title: TitleSummary;
  seasonNumber: number | null;
  episodeNumber: number | null;
  watchedAt: Date;
}

@Injectable()
export class HistoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly catalogService: CatalogService,
    private readonly profilesService: ProfilesService,
  ) {}

  async findRecent(userId: string, profileId: string): Promise<HistoryEntry[]> {
    await this.profilesService.ensureOwnership(userId, profileId);
    const entries = await this.prisma.watchHistoryEntry.findMany({
      where: { profileId },
      orderBy: { watchedAt: 'desc' },
      take: HISTORY_PAGE_SIZE,
      include: { title: { include: { genres: true } } },
    });
    return entries.map((entry) => ({
      title: this.catalogService.mapStoredTitle(entry.title),
      seasonNumber: entry.seasonNumber,
      episodeNumber: entry.episodeNumber,
      watchedAt: entry.watchedAt,
    }));
  }

  async record(userId: string, dto: RecordHistoryDto): Promise<void> {
    await this.profilesService.ensureOwnership(userId, dto.profileId);
    const titleId = await this.catalogService.ensureTitleCached(dto.mediaType, dto.tmdbId);
    const seasonNumber = dto.seasonNumber ?? null;
    const episodeNumber = dto.episodeNumber ?? null;

    const existing = await this.prisma.watchHistoryEntry.findFirst({
      where: { profileId: dto.profileId, titleId, seasonNumber, episodeNumber },
    });
    if (existing) {
      await this.prisma.watchHistoryEntry.update({
        where: { id: existing.id },
        data: { watchedAt: new Date() },
      });
      return;
    }
    await this.prisma.watchHistoryEntry.create({
      data: { profileId: dto.profileId, titleId, seasonNumber, episodeNumber },
    });
  }
}
