import { Injectable } from '@nestjs/common';
import Handlebars from 'handlebars';
import { ConfigService } from '@nestjs/config';
import { MailTransport } from './email.transport';

@Injectable()
export class MailService {
  private mailTransport: MailTransport;
  private from: string;
  private replyTo: string;

  private schema = {
    verification: {
      subject: 'User Verification',
      template: 'verification',
    },
    password: {
      subject: 'Password Reset',
      template: 'update-password',
    },
    userOnboarding: {
      subject: 'Welcome Abroad',
      template: 'user-onboarded',
    },
    test: {
      subject: 'Test',
      template: 'test',
    },
    contact: {
      subject: 'Query Created',
      template: 'contact',
    },
  };

  constructor(private configService: ConfigService) {
    this.from = `"Stockit" <${this.configService.get<string>('FROM_EMAIL_ADDRESS')}>`;
    this.replyTo = this.configService.get<string>('REPLY_TO_EMAIL_ADDRESS');

    if (!this.from) {
      throw new Error('FROM_EMAIL_ADDRESS is not defined');
    }

    const transport = this.configService.get<string>('MAIL_TRANSPORT');

    switch (transport) {
      case 'gmail':
        this.mailTransport = new MailTransport('gmail', 'handlebars', {
          user: this.configService.get<string>('GMAIL_EMAIL'),
          pass: this.configService.get<string>('GMAIL_APP_PASSWORD'),
        });
        break;

      case 'sendgrid':
        this.mailTransport = new MailTransport('sendgrid', 'handlebars', {
          auth: {
            api_key: this.configService.get<string>('SENDGRID_API'),
          },
        });
        break;
      case 'amazonSES':
      default:
        this.mailTransport = new MailTransport('amazonSES', 'handlebars', {
          region: this.configService.get<string>('AWS_REGION'),
          credentials: {
            accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
            secretAccessKey: this.configService.get<string>(
              'AWS_SECRET_ACCESS_KEY',
            ),
          },
        });
    }
  }

  async sendEmail(
    to: string,
    template?: string,
    context: object = {},
    html?: string,
    subject?: string,
  ) {
    let htmlTemplate = html;

    if (htmlTemplate) {
      const compiled = Handlebars.compile(htmlTemplate, { noEscape: true });
      htmlTemplate = compiled(context);
    }

    const message = {
      from: this.from,
      to,
      subject: subject ?? this.schema?.[template]?.subject,
      template: template ? this.schema[template].template : undefined,
      html: htmlTemplate,
      context,
      replyTo: this.replyTo,
    };

    return this.mailTransport.sendEmail(message);
  }

  async sendTemplateEmail(
    to: string,
    template: string,
    subject: string,
    context: Record<string, any>,
  ) {
    const message = {
      from: this.from,
      to,
      subject,
      template,
      context,
      replyTo: this.replyTo,
    };

    return this.mailTransport.sendEmail(message);
  }
}
