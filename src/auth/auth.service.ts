import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UserRole } from '@prisma/client';
import { JwtPayload, Tokens } from './types';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async signup(dto: SignupDto) {
    const exists = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { phone: dto.phone }],
      },
    });

    if (exists) {
      throw new BadRequestException('Email or phone already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        full_name: dto.full_name,
        email: dto.email,
        phone: dto.phone,
        password: hashedPassword,
        userRole: 'OWNER',
        loginProvider: 'PASSWORD',
      },
    });

    return {
      message: 'User registered successfully',
      userId: user.id,
    };
  }

  async login(dto: LoginDto) {
    try {
      const { identifier, password } = dto;

      const isEmail = identifier.includes('@');

      const user = await this.prisma.user.findFirst({
        where: {
          [isEmail ? 'email' : 'phone']: identifier,
        },
      });
      if (!user || !user.password) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      return this.getTokens(user.id, identifier, user.userRole);
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  /* ================= SEND OTP ================= */

  async sendOtp(dto: SendOtpDto) {
    try {
      const { identifier } = dto;

      if (!identifier) {
        throw new BadRequestException('Email or phone required');
      }

      const otp = this.generateOtp();

      const hash = await bcrypt.hash(otp, 10);

      const expires = new Date();
      expires.setMinutes(expires.getMinutes() + 5);

      await this.prisma.otp.deleteMany({
        where: { identifier },
      });

      await this.prisma.otp.create({
        data: {
          identifier,
          otpHash: hash,
          expiresAt: expires,
        },
      });
      console.log('OTP:', otp);

      return {
        message: 'OTP sent successfully',
        otp,
      };
    } catch (error) {
      console.error('Send OTP Error:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to send OTP');
    }
  }

  /* ================= VERIFY OTP ================= */

  async verifyOtp(dto: VerifyOtpDto) {
    try {
      const { identifier, otp } = dto;

      const record = await this.prisma.otp.findFirst({
        where: {
          identifier,
          verified: false,
          expiresAt: { gt: new Date() },
        },
      });

      if (!record) {
        throw new UnauthorizedException('OTP expired');
      }

      if (record.attempts >= 5) {
        throw new UnauthorizedException('Too many attempts');
      }

      const valid = await bcrypt.compare(otp, record.otpHash);

      if (!valid) {
        await this.prisma.otp.update({
          where: { id: record.id },
          data: {
            attempts: { increment: 1 },
          },
        });

        throw new UnauthorizedException('Invalid OTP');
      }

      await this.prisma.otp.update({
        where: { id: record.id },
        data: { verified: true },
      });

      const isEmail = identifier.includes('@');

      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email: isEmail ? identifier : undefined },
            { phone: !isEmail ? identifier : undefined },
          ],
        },
      });

      let user;

      if (existingUser) {
        user = await this.prisma.user.update({
          where: { id: existingUser.id },
          data: {
            isVerifiedEmail: isEmail ? true : existingUser.isVerifiedEmail,

            isVerifiedPhone: !isEmail ? true : existingUser.isVerifiedPhone,

            lastLogin: new Date(),
          },
        });
      } else {
        user = await this.prisma.user.create({
          data: {
            email: isEmail ? identifier : null,
            phone: !isEmail ? identifier : null,

            loginProvider: 'OTP',

            isVerifiedEmail: isEmail,
            isVerifiedPhone: !isEmail,

            isFirstLogin: true,
            isActive: true,
          },
        });
      }

      const safeUser = {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.userRole,
        isVerifiedEmail: user.isVerifiedEmail,
        isVerifiedPhone: user.isVerifiedPhone,
        isFirstLogin: user.isFirstLogin,
        onboarded: user.onboarded,
      };

      const tokens = await this.getTokens(user.id, identifier, user.role);

      return {
        user: safeUser,
        tokens,
      };
    } catch (error) {
      console.error('Verify OTP Error:', error);

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async refreshToken(dto: RefreshTokenDto) {}

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        hashedRt: null,
      },
    });

    return { message: 'Logged out successfully' };
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // helpers
  private async getTokens(
    userId: string,
    identification: string,
    role: UserRole = UserRole.SALE_OPERATOR,
  ): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      sub: userId,
      identification: identification,
      role: [role],
    };
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('AT_SECRET'),
        expiresIn: 60 * 60 * 24 * 7,
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('RT_SECRET'),
        expiresIn: 60 * 60 * 24 * 7,
      }),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }
}
