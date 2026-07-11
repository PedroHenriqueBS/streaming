import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const configValues: Record<string, unknown> = {
    JWT_REFRESH_SECRET: 'test-refresh-secret',
    JWT_REFRESH_TTL_DAYS: 7,
  };

  const userRecord = {
    id: 'user-1',
    name: 'Pedro',
    email: 'pedro@test.dev',
    plan: 'PREMIUM',
    passwordHash: '',
  };

  beforeAll(async () => {
    userRecord.passwordHash = await bcrypt.hash('secret123', 4);
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: { signAsync: jest.fn().mockResolvedValue('signed-jwt') } },
        {
          provide: ConfigService,
          useValue: { getOrThrow: jest.fn((key: string) => configValues[key]) },
        },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
    prismaMock.refreshToken.create.mockResolvedValue({});
  });

  describe('register', () => {
    it('creates the user with preferences and an initial profile', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue(userRecord);

      const session = await service.register({
        name: 'Pedro Henrique',
        email: 'Pedro@Test.dev',
        password: 'secret123',
      });

      const createArgs = prismaMock.user.create.mock.calls[0][0];
      expect(createArgs.data.email).toBe('pedro@test.dev');
      expect(createArgs.data.preferences).toEqual({ create: {} });
      expect(createArgs.data.profiles.create.name).toBe('Pedro');
      expect(session.accessToken).toBe('signed-jwt');
      expect(session.refreshToken).toEqual(expect.any(String));
    });

    it('rejects duplicated e-mails', async () => {
      prismaMock.user.findUnique.mockResolvedValue(userRecord);

      await expect(
        service.register({ name: 'Pedro', email: 'pedro@test.dev', password: 'secret123' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('login', () => {
    it('returns a session for valid credentials', async () => {
      prismaMock.user.findUnique.mockResolvedValue(userRecord);

      const session = await service.login({ email: 'pedro@test.dev', password: 'secret123' });

      expect(session.user).toEqual({
        id: 'user-1',
        name: 'Pedro',
        email: 'pedro@test.dev',
        plan: 'PREMIUM',
      });
      expect(prismaMock.refreshToken.create).toHaveBeenCalled();
    });

    it('rejects wrong passwords without leaking which field failed', async () => {
      prismaMock.user.findUnique.mockResolvedValue(userRecord);

      await expect(
        service.login({ email: 'pedro@test.dev', password: 'wrong-pass' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects unknown e-mails', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'ghost@test.dev', password: 'secret123' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('rotates the refresh token: revokes the old one and issues a new session', async () => {
      prismaMock.refreshToken.findUnique.mockResolvedValue({
        id: 'token-1',
        revokedAt: null,
        expiresAt: new Date(Date.now() + 60_000),
        user: userRecord,
      });

      const session = await service.refresh('raw-refresh-token');

      expect(prismaMock.refreshToken.update).toHaveBeenCalledWith({
        where: { id: 'token-1' },
        data: { revokedAt: expect.any(Date) },
      });
      expect(prismaMock.refreshToken.create).toHaveBeenCalled();
      expect(session.refreshToken).not.toBe('raw-refresh-token');
    });

    it('rejects revoked tokens', async () => {
      prismaMock.refreshToken.findUnique.mockResolvedValue({
        id: 'token-1',
        revokedAt: new Date(),
        expiresAt: new Date(Date.now() + 60_000),
        user: userRecord,
      });

      await expect(service.refresh('raw-refresh-token')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('rejects expired tokens and missing cookies', async () => {
      prismaMock.refreshToken.findUnique.mockResolvedValue({
        id: 'token-1',
        revokedAt: null,
        expiresAt: new Date(Date.now() - 1),
        user: userRecord,
      });

      await expect(service.refresh('raw-refresh-token')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      await expect(service.refresh(undefined)).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
