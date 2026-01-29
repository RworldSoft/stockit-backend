import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { TokenUtil } from './utils/token.util';
import { HashUtil } from './utils/hash.util';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  /* ================= SIGNUP (PASSWORD) ================= */

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

  /* ================= LOGIN (PASSWORD) ================= */

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.identifier }, { phone: dto.identifier }],
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    if (!user.password) {
      throw new BadRequestException('Login with OTP');
    }

    const match = await bcrypt.compare(dto.password, user.password);

    if (!match) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  /* ================= SEND OTP ================= */

  async sendOtp(dto: SendOtpDto) {
    const { identifier } = dto;

    if (!identifier) {
      throw new BadRequestException('Email or phone required');
    }

    // Generate OTP
    const otp = this.generateOtp();

    const hash = await bcrypt.hash(otp, 10);

    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 5);

    // Delete old OTPs
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

    // TODO: Replace with SMS/Email Service
    console.log('OTP:', otp);

    return {
      success: true,
      message: 'OTP sent successfully',
    };
  }

  /* ================= VERIFY OTP ================= */

  async verifyOtp(dto: VerifyOtpDto) {
    const { identifier, otp } = dto;

    // 1️⃣ Find OTP record
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

    // 2️⃣ Verify OTP
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

    // 3️⃣ Mark OTP as verified
    await this.prisma.otp.update({
      where: { id: record.id },
      data: { verified: true },
    });

    const isEmail = identifier.includes('@');

    // 4️⃣ Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: isEmail ? identifier : undefined },
          { phone: !isEmail ? identifier : undefined },
        ],
      },
    });

    let user;

    // 5️⃣ If user exists → update
    if (existingUser) {
      user = await this.prisma.user.update({
        where: { id: existingUser.id },
        data: {
          isVerifiedEmail: isEmail ? true : existingUser.isVerifiedEmail,
          isVerifiedPhone: !isEmail ? true : existingUser.isVerifiedPhone,
          lastLogin: new Date(),
        },
      });
    }

    // 6️⃣ If user does not exist → create
    else {
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

    // 7️⃣ Generate JWT
    return this.generateTokens(user);
  }

  /* ================= HELPERS ================= */

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async generateTokens(user: any) {
    const payload = {
      sub: user.id,
      role: user.userRole,
      email: user.email,
    };

    const accessToken = TokenUtil.generateAccessToken(payload);

    const refreshToken = TokenUtil.generateRefreshToken(payload);

    const hashedRt = await HashUtil.hash(refreshToken);

    // Save refresh token in DB
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        hashedRt,
        lastLogin: new Date(),
        isFirstLogin: false,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.userRole,
        onboarded: user.onboarded,
        isFirstLogin: user.isFirstLogin,
      },
    };
  }
  async refreshToken(dto: RefreshTokenDto) {
    const { refreshToken } = dto;

    try {
      const payload: any = jwt.verify(refreshToken, process.env.JWT_RT_SECRET);

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.hashedRt) {
        throw new UnauthorizedException();
      }

      const match = await HashUtil.compare(refreshToken, user.hashedRt);

      if (!match) {
        throw new UnauthorizedException();
      }

      return this.generateTokens(user);
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        hashedRt: null,
      },
    });

    return { message: 'Logged out successfully' };
  }
}
