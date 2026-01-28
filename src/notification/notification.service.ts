import { Injectable, Logger } from '@nestjs/common';
// import { SMSService } from './sms/sms.service';
// import { MailService } from './mail/mail.service';
// import { CustomForbiddenException } from '@common/exceptions/customForbidden.exception';
import { MailService } from './email/email.service';
// import { NOTIFICATION_MAP } from './notification-events.map';

@Injectable()
export class NotificationsService {
  private logger = new Logger('NotificationsService');

  constructor(
    // private readonly smsService: SMSService,
    private readonly mailService: MailService,
  ) {}

  // async sendOtp(phone: string) {
  //   try {
  //     const verification = await this.smsService.phoneVerify(phone);
  //     return {
  //       success: true,
  //       to: verification.to,
  //       channel: verification.channel,
  //       status: verification.status, // 'pending'
  //       sid: verification.sid,
  //     };
  //   } catch (error) {
  //     this.logger.error(`Error while sending otp: ${error}`);
  //     throw new CustomForbiddenException('Error sending otp');
  //   }
  // }

  // async verifyOtp(phone: string, code: string) {
  //   try {
  //     const verificationCheck = await this.smsService.otpCheck(phone, code);
  //     if (verificationCheck.valid) {
  //       return {
  //         success: true,
  //         to: verificationCheck.to,
  //         channel: verificationCheck.channel,
  //         status: verificationCheck.status,
  //         sid: verificationCheck.sid,
  //       };
  //     } else {
  //       return {
  //         success: false,
  //         to: verificationCheck.to,
  //         status: verificationCheck.status,
  //         sid: verificationCheck.sid,
  //       };
  //     }
  //   } catch (error) {
  //     this.logger.error(`Error while verifying otp: ${error}`);
  //     throw new CustomForbiddenException('Error verifying otp');
  //   }
  // }

  async sendEmail(
    to: string,
    template: string | undefined = undefined,
    context: object,
    html: string | undefined = undefined,
    subject: string | undefined = undefined,
  ) {
    try {
      return this.mailService.sendEmail(to, template, context, subject, html);
    } catch (error) {
      this.logger.error(`Error while sending email: ${error}`);
      throw new Error('Error sending email');
    }
  }

  // async sendSms(to: string, message: string, data: object = {}) {
  //   try {
  //     await this.smsService.sendMessage(to, message, data);
  //   } catch (error) {
  //     this.logger.error(`Error while sending sms: ${error}`);
  //     throw new CustomForbiddenException('Error sending sms');
  //   }
  // }

  // async sendNotification(eventKey: string, payload: any) {
  //   const config = NOTIFICATION_MAP[eventKey];

  //   if (!config) {
  //     throw new Error(`No notification config for ${eventKey}`);
  //   }

  //   return this.mailService.sendTemplateEmail(
  //     payload.to,
  //     config.template,
  //     config.title,
  //     {
  //       title: config.title,
  //       heading: config.heading,
  //       recipientName: payload.name,
  //       message: payload.message,
  //       actionUrl: payload.actionUrl,
  //       actionText: payload.actionText,
  //       extraNote: payload.extraNote,
  //     },
  //   );
  // }
}
