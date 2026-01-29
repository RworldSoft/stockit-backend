import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OnboardingService {
  constructor(private prisma: PrismaService) {}

  async completeOnboarding(userId: string, dto: any) {
    // 1️⃣ Get user + profile
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // 2️⃣ Already onboarded check
    if (user.onboarded) {
      throw new BadRequestException('Already onboarded');
    }

    // 3️⃣ Protect verified fields
    if (user.isVerifiedEmail && dto.email && dto.email !== user.email) {
      throw new BadRequestException('Email is locked');
    }

    if (user.isVerifiedPhone && dto.phone && dto.phone !== user.phone) {
      throw new BadRequestException('Phone is locked');
    }

    // 4️⃣ Update User table
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        full_name: dto.full_name ?? user.full_name,
        email: dto.email ?? user.email,
        phone: dto.phone ?? user.phone,

        onboarded: true,
        isFirstLogin: false,
      },
    });

    // 5️⃣ Create / Update Profile
    if (user.profile) {
      await this.prisma.profile.update({
        where: { userId },
        data: {
          business_name: dto.business_name,
        },
      });
    } else {
      await this.prisma.profile.create({
        data: {
          userId,
          business_name: dto.business_name,
        },
      });
    }

    return {
      message: 'Onboarding completed successfully',
    };
  }
}
