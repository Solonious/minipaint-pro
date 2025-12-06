import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;
  private readonly frontendUrl: string;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:4200');
    this.fromEmail = this.configService.get<string>('SMTP_FROM', 'noreply@minipaint-pro.com');

    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${this.frontendUrl}/auth/verify-email?token=${token}`;

    try {
      await this.transporter.sendMail({
        from: this.fromEmail,
        to: email,
        subject: 'Verify your MiniPaint Pro account',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Verify Your Email</title>
          </head>
          <body style="font-family: 'Rajdhani', Arial, sans-serif; background-color: #0a0a0f; color: #e8e6e3; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #12121a; border-radius: 8px; padding: 40px; border: 1px solid #2a2a3a;">
              <h1 style="color: #c9a227; font-family: 'Cinzel', serif; margin-bottom: 24px;">Welcome to MiniPaint Pro!</h1>
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                Thank you for registering. Please verify your email address by clicking the button below:
              </p>
              <a href="${verificationUrl}" style="display: inline-block; background-color: #c9a227; color: #0a0a0f; padding: 12px 32px; text-decoration: none; border-radius: 4px; font-weight: bold; margin-bottom: 24px;">
                Verify Email
              </a>
              <p style="font-size: 14px; color: #9a9890; margin-top: 24px;">
                Or copy and paste this link into your browser:<br>
                <a href="${verificationUrl}" style="color: #c9a227;">${verificationUrl}</a>
              </p>
              <p style="font-size: 14px; color: #9a9890; margin-top: 24px;">
                This link will expire in 24 hours.
              </p>
              <hr style="border: none; border-top: 1px solid #2a2a3a; margin: 32px 0;">
              <p style="font-size: 12px; color: #5a584f;">
                If you didn't create an account with MiniPaint Pro, you can safely ignore this email.
              </p>
            </div>
          </body>
          </html>
        `,
      });

      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}`, error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${this.frontendUrl}/auth/reset-password?token=${token}`;

    try {
      await this.transporter.sendMail({
        from: this.fromEmail,
        to: email,
        subject: 'Reset your MiniPaint Pro password',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Reset Your Password</title>
          </head>
          <body style="font-family: 'Rajdhani', Arial, sans-serif; background-color: #0a0a0f; color: #e8e6e3; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #12121a; border-radius: 8px; padding: 40px; border: 1px solid #2a2a3a;">
              <h1 style="color: #c9a227; font-family: 'Cinzel', serif; margin-bottom: 24px;">Password Reset Request</h1>
              <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                We received a request to reset your password. Click the button below to create a new password:
              </p>
              <a href="${resetUrl}" style="display: inline-block; background-color: #c9a227; color: #0a0a0f; padding: 12px 32px; text-decoration: none; border-radius: 4px; font-weight: bold; margin-bottom: 24px;">
                Reset Password
              </a>
              <p style="font-size: 14px; color: #9a9890; margin-top: 24px;">
                Or copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #c9a227;">${resetUrl}</a>
              </p>
              <p style="font-size: 14px; color: #9a9890; margin-top: 24px;">
                This link will expire in 1 hour.
              </p>
              <hr style="border: none; border-top: 1px solid #2a2a3a; margin: 32px 0;">
              <p style="font-size: 12px; color: #5a584f;">
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
            </div>
          </body>
          </html>
        `,
      });

      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}`, error);
      throw error;
    }
  }
}
