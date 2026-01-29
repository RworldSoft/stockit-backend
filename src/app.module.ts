import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { NotificationsService } from './notification/notification.service';
import { NotificationModule } from './notification/notification.module';
import { OnboardingModule } from './onboarding/onboarding.module';

@Module({
  imports: [PrismaModule, AuthModule, OnboardingModule, ],
  providers: [],
})
export class AppModule {}
