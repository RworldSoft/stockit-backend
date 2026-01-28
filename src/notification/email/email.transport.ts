import path from 'path';
import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
// import sendgridTransport from 'nodemailer-sendgrid-transport';
// import { SendEmailCommand, SESv2Client } from '@aws-sdk/client-sesv2';
import fs from 'fs';
import Handlebars from 'handlebars';
export class MailTransport {
  private transporter: any;

  constructor(transport: string, templateEngine: string, options: any) {
    switch (transport) {
      case 'smtp': {
        this.transporter = nodemailer.createTransport(options);
        break;
      }

      case 'gmail': {
        this.transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: options.user,
            pass: options.pass,
          },
        });
        break;
      }

      // case 'sendgrid': {
      //   this.transporter = nodemailer.createTransport(
      //     sendgridTransport(options),
      //   );
      //   break;
      // }

      // case 'amazonSES': {
      //   const sesClient = new SESv2Client(options);

      //   this.transporter = nodemailer.createTransport({
      //     SES: {
      //       sesClient,
      //       SendEmailCommand,
      //     },
      //   });
      //   break;
      // }

      default:
        throw new Error('Invalid transport');
    }

    if (templateEngine === 'handlebars') {
      Handlebars.registerHelper('currentYear', () => {
        return new Date().getFullYear();
      });

      const possiblePaths = [
        path.resolve(__dirname, './layouts'),
        path.resolve(process.cwd(), 'src/notifications/mail/layouts'),
      ];

      // const templatesDir = path.join(
      //     __dirname,
      //     'layouts',
      // );
      const templatesDir = possiblePaths.find((p) => fs.existsSync(p));

      if (!templatesDir) {
        throw new Error('Missing Handlebars templates directory');
      }

      console.log('TEMPLATES DIR:', templatesDir);
      console.log('FILES:', fs.readdirSync(templatesDir));

      this.transporter.use(
        'compile',
        hbs({
          viewEngine: {
            extname: '.hbs',
            layoutsDir: templatesDir,
            defaultLayout: '_base',
          },
          viewPath: templatesDir,
          extname: '.hbs',
        }),
      );
    }
  }

  async sendEmail(message: {
    from: string;
    to: string;
    subject: string;
    template?: string;
    context?: object;
    html?: string;
  }) {
    try {
      const res = await this.transporter.sendMail(message);

      return {
        success: true,
        messageId: res.messageId,
        accepted: res.accepted,
        rejected: res.rejected,
      };
    } catch (error) {
      console.error(' Email send failed:', {
        message: error?.message,
        code: error?.code,
        response: error?.response,
      });
      return {
        success: false,
        error: 'EMAIL_SEND_FAILED',
      };
    }
  }
}
