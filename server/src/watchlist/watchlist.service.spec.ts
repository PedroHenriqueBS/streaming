import { Test } from '@nestjs/testing';
import { CatalogService } from '../catalog/catalog.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProfilesService } from '../profiles/profiles.service';
import { WatchlistService } from './watchlist.service';

describe('WatchlistService', () => {
  let service: WatchlistService;

  const prismaMock = {
    watchlistItem: {
      findMany: jest.fn(),
      upsert: jest.fn(),
      deleteMany: jest.fn(),
    },
  };
  const catalogMock = {
    ensureTitleCached: jest.fn(),
    mapStoredTitle: jest.fn((title: { name: string }) => ({ title: title.name })),
  };
  const profilesMock = { ensureOwnership: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        WatchlistService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: CatalogService, useValue: catalogMock },
        { provide: ProfilesService, useValue: profilesMock },
      ],
    }).compile();
    service = moduleRef.get(WatchlistService);
    prismaMock.watchlistItem.findMany.mockResolvedValue([
      { title: { name: 'Vertigem', genres: [] } },
    ]);
  });

  it('validates profile ownership before listing', async () => {
    await service.findAll('user-1', 'profile-1');
    expect(profilesMock.ensureOwnership).toHaveBeenCalledWith('user-1', 'profile-1');
  });

  it('caches the title locally and upserts idempotently when adding', async () => {
    catalogMock.ensureTitleCached.mockResolvedValue('title-db-id');

    const items = await service.add('user-1', 'profile-1', 'movie', 42);

    expect(catalogMock.ensureTitleCached).toHaveBeenCalledWith('movie', 42);
    expect(prismaMock.watchlistItem.upsert).toHaveBeenCalledWith({
      where: { profileId_titleId: { profileId: 'profile-1', titleId: 'title-db-id' } },
      update: {},
      create: { profileId: 'profile-1', titleId: 'title-db-id' },
    });
    expect(items).toEqual([{ title: 'Vertigem' }]);
  });

  it('removes by tmdb identity and returns the fresh list', async () => {
    await service.remove('user-1', 'profile-1', 'tv', 99);

    expect(prismaMock.watchlistItem.deleteMany).toHaveBeenCalledWith({
      where: { profileId: 'profile-1', title: { tmdbId: 99, mediaType: 'TV' } },
    });
    expect(prismaMock.watchlistItem.findMany).toHaveBeenCalled();
  });
});
