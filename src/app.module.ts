import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { NotificationsService } from './notification/notification.service';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [PrismaModule, AuthModule, ],
  providers: [],
})
export class AppModule {}
