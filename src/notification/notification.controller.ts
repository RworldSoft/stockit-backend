import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { UserRole } from '@prisma/client';
import { NotificationsService } from './notification.service';
import { Roles } from '@common/decorators/roles.decorator';
import { SendEmailDto } from './dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller({
  path: 'notifications',
  version: '1',
})
export class NotificationsController {
  private logger = new Logger('NotificationsController');

  constructor(private readonly notificationService: NotificationsService) {}

  // @Post('send-sms')
  // @Roles(UserRole.OWNER, UserRole.SALE_OPERATOR)
  // @ApiOperation({ summary: 'Send SMS' })
  // @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  // @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  // @ApiResponse({
  //   status: HttpStatus.INTERNAL_SERVER_ERROR,
  //   description: 'Internal Server Error',
  // })
  // async sendSms(@Body() dto: SendSMSDto) {
  //   return this.notificationService.sendSms(
  //     dto.phone,
  //     dto.message,
  //     dto.context,
  //   );
  // }

  @Post('send-email')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Send Email' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Email sent successfully',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal Server Error',
  })
  async sendEmail(@Body() dto: SendEmailDto) {
    const { email, template, context = {}, html, subject } = dto;

    return this.notificationService.sendEmail(
      email,
      template,
      context,
      html,
      subject,
    );
  }

  // @Post('send-notification')
  // @Roles(UserRole.ADMIN, UserRole.USER)
  // @ApiOperation({ summary: 'Send Email Notification' })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   description: 'Notification sent successfully',
  // })
  // @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  // @ApiResponse({
  //   status: HttpStatus.INTERNAL_SERVER_ERROR,
  //   description: 'Internal Server Error',
  // })
  // async sendNotification(@Body() dto: SendNotificationDto) {
  //   return this.notificationService.sendNotification(dto.eventKey, dto);
  // }

  @Post('create-templates')
  @ApiOperation({ summary: 'Create Templates' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal Server Error',
  })
  async createTemplates() {}

  @Get('templates')
  @ApiOperation({ summary: 'Get Templates' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal Server Error',
  })
  async getTemplates() {}

  @Get('template/:id')
  @ApiOperation({ summary: 'Get Template' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal Server Error',
  })
  async getTemplate() {}
}
