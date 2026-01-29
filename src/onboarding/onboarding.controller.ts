import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { OnboardingService } from './onboarding.service';
import { JwtAuthGuard } from 'auth/guards/jwt-auth.guard';
import { OnboardingDto } from './dto/onboarding.dto';

@ApiTags('Onboarding') // 👈 Group
@ApiBearerAuth() // 👈 JWT
@Controller('onboarding')
export class OnboardingController {
  constructor(private service: OnboardingService) {}

  @UseGuards(JwtAuthGuard)
  @Post('complete')
  @ApiOperation({ summary: 'Complete user onboarding' })
  complete(@Req() req, @Body() dto: OnboardingDto) {
    return this.service.completeOnboarding(req.user.sub, dto);
  }
}
