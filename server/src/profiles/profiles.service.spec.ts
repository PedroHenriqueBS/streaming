import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ProfilesService } from './profiles.service';

describe('ProfilesService', () => {
  let service: ProfilesService;

  const prismaMock = {
    profile: {
      count: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [ProfilesService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();
    service = moduleRef.get(ProfilesService);
  });

  it('creates a profile while under the limit', async () => {
    prismaMock.profile.count.mockResolvedValue(4);
    prismaMock.profile.create.mockResolvedValue({ id: 'p5', name: 'Kids', avatarHue: 140 });

    await expect(service.create('user-1', { name: '  Kids  ', avatarHue: 140 })).resolves.toEqual({
      id: 'p5',
      name: 'Kids',
      avatarHue: 140,
    });
    expect(prismaMock.profile.create.mock.calls[0][0].data.name).toBe('Kids');
  });

  it('rejects the sixth profile', async () => {
    prismaMock.profile.count.mockResolvedValue(5);

    await expect(service.create('user-1', { name: 'Extra', avatarHue: 20 })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prismaMock.profile.create).not.toHaveBeenCalled();
  });

  it('refuses to delete the last remaining profile', async () => {
    prismaMock.profile.findUnique.mockResolvedValue({ id: 'p1', userId: 'user-1' });
    prismaMock.profile.count.mockResolvedValue(1);

    await expect(service.remove('user-1', 'p1')).rejects.toBeInstanceOf(BadRequestException);
    expect(prismaMock.profile.delete).not.toHaveBeenCalled();
  });

  it('deletes when other profiles remain', async () => {
    prismaMock.profile.findUnique.mockResolvedValue({ id: 'p2', userId: 'user-1' });
    prismaMock.profile.count.mockResolvedValue(3);

    await service.remove('user-1', 'p2');
    expect(prismaMock.profile.delete).toHaveBeenCalledWith({ where: { id: 'p2' } });
  });

  it("hides other users' profiles as not found", async () => {
    prismaMock.profile.findUnique.mockResolvedValue({ id: 'p9', userId: 'someone-else' });

    await expect(service.ensureOwnership('user-1', 'p9')).rejects.toBeInstanceOf(NotFoundException);
  });
});
