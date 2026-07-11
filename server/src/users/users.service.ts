import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAccountDto } from './dto/update-account.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getAccount(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { preferences: true },
    });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }
    const preferences =
      user.preferences ??
      (await this.prisma.userPreferences.create({ data: { userId: user.id } }));
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      preferences: {
        autoplay: preferences.autoplay,
        previews: preferences.previews,
        subtitles: preferences.subtitles,
        releaseNotifications: preferences.releaseNotifications,
        videoQuality: preferences.videoQuality,
      },
    };
  }

  async updateAccount(userId: string, dto: UpdateAccountDto) {
    if (dto.email) {
      const email = dto.email.trim().toLowerCase();
      const existing = await this.prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== userId) {
        throw new ConflictException('Este e-mail já está em uso.');
      }
      dto.email = email;
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.email !== undefined ? { email: dto.email } : {}),
      },
    });
    return this.getAccount(userId);
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    await this.prisma.userPreferences.upsert({
      where: { userId },
      update: dto,
      create: { userId, ...dto },
    });
    return this.getAccount(userId);
  }

  async updatePlan(userId: string, dto: UpdatePlanDto) {
    await this.prisma.user.update({ where: { id: userId }, data: { plan: dto.plan } });
    return this.getAccount(userId);
  }
}
