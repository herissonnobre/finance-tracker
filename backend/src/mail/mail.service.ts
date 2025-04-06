import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { generateResetPasswordEmailHtml } from './templates/reset-password.template';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly from: string;

  constructor(private readonly configService: ConfigService) {
    const mailConfig = this.configService.get('mail');

    this.transporter = nodemailer.createTransport({
      host: mailConfig.host,
      port: mailConfig.port,
      secure: false, // Gmail usa TLS (não SSL)
      auth: {
        user: mailConfig.user,
        pass: mailConfig.pass,
      },
    });

    this.from = mailConfig.from;
  }

  async sendPasswordRecoveryEmail(to: string, token: string): Promise<void> {
    const mailOptions: nodemailer.SendMailOptions = {
      from: this.from,
      to,
      subject: 'Password Recovery',
      html: generateResetPasswordEmailHtml(token),
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Email error:', error);
      throw new InternalServerErrorException('Failed to send recovery email.');
    }
  }
}
