import { CustomForbiddenException } from '@common/exceptions/customForbidden.exception';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { UpdateProfileDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentUser(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          email: true,
          full_name: true,
          phone: true,
          userRole: true,
          loginProvider: true,
          onboarded: true,
        },
      });
      return user;
    } catch (error) {
      throw new CustomForbiddenException('Invalid token');
    }
  }

  // async updateOnboardedStatus(userId: string) {
  //   try {
  //     const updatedUser = await this.prisma.user.update({
  //       where: {
  //         id: userId,
  //       },
  //       data: {
  //         onboarded: true,
  //       },
  //     });
  //     return updatedUser;
  //   } catch (error) {
  //     throw new CustomForbiddenException('Invalid token');
  //   }
  // }

  async updateUserProfile(userId: string, dto: UpdateProfileDto) {
    try {
      const { first_name, last_name, email, phone, business_name } = dto;

      if (!first_name || !email || !phone || !business_name) {
        throw new CustomForbiddenException('All fields are required');
      }
      const fullName = last_name ? `${first_name} ${last_name}` : first_name;

      const user = await this.prisma.user.update({
        where: { id: userId },

        data: {
          first_name,
          last_name : last_name ? last_name : null,
          full_name: fullName,
          email,
          phone,

          onboarded: true,

          profile: {
            upsert: {
              create: {
                business_name,
              },
              update: {
                business_name,
              },
            },
          },
        },

        include: {
          profile: true,
        },
      });

      return user;
    } catch (error) {
      throw new CustomForbiddenException('Could not update profile');
    }
  }
}
