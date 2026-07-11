import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

export const MAX_PROFILES_PER_USER = 5;

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.profile.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true, avatarHue: true },
    });
  }

  async create(userId: string, dto: CreateProfileDto) {
    const count = await this.prisma.profile.count({ where: { userId } });
    if (count >= MAX_PROFILES_PER_USER) {
      throw new BadRequestException(`Limite de ${MAX_PROFILES_PER_USER} perfis atingido.`);
    }
    return this.prisma.profile.create({
      data: { userId, name: dto.name.trim(), avatarHue: dto.avatarHue },
      select: { id: true, name: true, avatarHue: true },
    });
  }

  async update(userId: string, profileId: string, dto: UpdateProfileDto) {
    await this.ensureOwnership(userId, profileId);
    return this.prisma.profile.update({
      where: { id: profileId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.avatarHue !== undefined ? { avatarHue: dto.avatarHue } : {}),
      },
      select: { id: true, name: true, avatarHue: true },
    });
  }

  async remove(userId: string, profileId: string): Promise<void> {
    await this.ensureOwnership(userId, profileId);
    const count = await this.prisma.profile.count({ where: { userId } });
    if (count <= 1) {
      throw new BadRequestException('A conta precisa ter pelo menos um perfil.');
    }
    await this.prisma.profile.delete({ where: { id: profileId } });
  }

  async ensureOwnership(userId: string, profileId: string): Promise<void> {
    const profile = await this.prisma.profile.findUnique({ where: { id: profileId } });
    if (!profile || profile.userId !== userId) {
      throw new NotFoundException('Perfil não encontrado.');
    }
  }
}
