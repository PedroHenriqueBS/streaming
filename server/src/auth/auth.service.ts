import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHmac, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

const BCRYPT_ROUNDS = 12;
const DEFAULT_AVATAR_HUE = 40;

export interface AuthenticatedAccount {
  id: string;
  name: string;
  email: string;
  plan: string;
}

export interface AuthSession {
  user: AuthenticatedAccount;
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthSession> {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Este e-mail já está cadastrado.');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email,
        passwordHash,
        preferences: { create: {} },
        profiles: {
          create: { name: dto.name.trim().split(' ')[0], avatarHue: DEFAULT_AVATAR_HUE },
        },
      },
    });

    return this.createSession(user);
  }

  async login(dto: LoginDto): Promise<AuthSession> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }
    return this.createSession(user);
  }

  async refresh(rawRefreshToken: string | undefined): Promise<AuthSession> {
    const stored = await this.findValidRefreshToken(rawRefreshToken);
    if (!stored) {
      throw new UnauthorizedException('Sessão expirada. Entre novamente.');
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });
    return this.createSession(stored.user);
  }

  async logout(rawRefreshToken: string | undefined): Promise<void> {
    const stored = await this.findValidRefreshToken(rawRefreshToken);
    if (stored) {
      await this.prisma.refreshToken.update({
        where: { id: stored.id },
        data: { revokedAt: new Date() },
      });
    }
  }

  async getAccount(userId: string): Promise<AuthenticatedAccount> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.toAccount(user);
  }

  private async createSession(user: {
    id: string;
    name: string;
    email: string;
    plan: string;
  }): Promise<AuthSession> {
    const accessToken = await this.jwtService.signAsync({ sub: user.id, email: user.email });

    const refreshToken = randomBytes(48).toString('base64url');
    const refreshTtlDays = this.configService.getOrThrow<number>('JWT_REFRESH_TTL_DAYS');
    const refreshExpiresAt = new Date(Date.now() + refreshTtlDays * 24 * 60 * 60 * 1000);
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashRefreshToken(refreshToken),
        expiresAt: refreshExpiresAt,
      },
    });

    return { user: this.toAccount(user), accessToken, refreshToken, refreshExpiresAt };
  }

  private async findValidRefreshToken(rawRefreshToken: string | undefined) {
    if (!rawRefreshToken) {
      return null;
    }
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: this.hashRefreshToken(rawRefreshToken) },
      include: { user: true },
    });
    if (!stored || stored.revokedAt || stored.expiresAt <= new Date()) {
      return null;
    }
    return stored;
  }

  private hashRefreshToken(rawToken: string): string {
    const secret = this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
    return createHmac('sha256', secret).update(rawToken).digest('hex');
  }

  private toAccount(user: {
    id: string;
    name: string;
    email: string;
    plan: string;
  }): AuthenticatedAccount {
    return { id: user.id, name: user.name, email: user.email, plan: user.plan };
  }
}
