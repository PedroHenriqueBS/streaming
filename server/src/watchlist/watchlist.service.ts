import { Injectable } from '@nestjs/common';
import { CatalogService } from '../catalog/catalog.service';
import { ApiMediaType, TitleSummary } from '../catalog/types/catalog.types';
import { MediaType } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { ProfilesService } from '../profiles/profiles.service';

@Injectable()
export class WatchlistService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly catalogService: CatalogService,
    private readonly profilesService: ProfilesService,
  ) {}

  async findAll(userId: string, profileId: string): Promise<TitleSummary[]> {
    await this.profilesService.ensureOwnership(userId, profileId);
    const items = await this.prisma.watchlistItem.findMany({
      where: { profileId },
      orderBy: { createdAt: 'desc' },
      include: { title: { include: { genres: true } } },
    });
    return items.map((item) => this.catalogService.mapStoredTitle(item.title));
  }

  async add(
    userId: string,
    profileId: string,
    mediaType: ApiMediaType,
    tmdbId: number,
  ): Promise<TitleSummary[]> {
    await this.profilesService.ensureOwnership(userId, profileId);
    const titleId = await this.catalogService.ensureTitleCached(mediaType, tmdbId);
    await this.prisma.watchlistItem.upsert({
      where: { profileId_titleId: { profileId, titleId } },
      update: {},
      create: { profileId, titleId },
    });
    return this.findAll(userId, profileId);
  }

  async remove(
    userId: string,
    profileId: string,
    mediaType: ApiMediaType,
    tmdbId: number,
  ): Promise<TitleSummary[]> {
    await this.profilesService.ensureOwnership(userId, profileId);
    const dbMediaType = mediaType === 'movie' ? MediaType.MOVIE : MediaType.TV;
    await this.prisma.watchlistItem.deleteMany({
      where: { profileId, title: { tmdbId, mediaType: dbMediaType } },
    });
    return this.findAll(userId, profileId);
  }
}
