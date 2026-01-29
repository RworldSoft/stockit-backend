import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PrismaModule,

    PassportModule.register({
      defaultStrategy: 'jwt', // ✅ ADD
    }),

    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    JwtStrategy, // ✅ ADD THIS
  ],
})
export class AuthModule {}
