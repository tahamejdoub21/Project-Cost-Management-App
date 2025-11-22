import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly apiKey: string;
  private readonly fromEmail: string;
  private readonly fromName: string;
  private readonly apiUrl = 'https://api.mailapi.dev/v1/email/send';

  constructor() {
    this.apiKey = process.env.MAILAPI_API_KEY || '';
    this.fromEmail = process.env.MAILAPI_FROM_EMAIL || '';
    this.fromName = process.env.MAILAPI_FROM_NAME || 'Project Cost Management';

    if (!this.apiKey || !this.fromEmail) {
      this.logger.warn(
        'MailAPI configuration is missing. Email functionality will not work.',
      );
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          from: {
            email: this.fromEmail,
            name: this.fromName,
          },
          to: [
            {
              email: options.to,
            },
          ],
          subject: options.subject,
          html: options.html,
          text: options.text || this.stripHtml(options.html),
        },
        {
          headers: {
            'X-API-Key': this.apiKey,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`Email sent successfully to ${options.to}`);
      return response.status === 200;
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${options.to}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return false;
    }
  }

  async sendVerificationEmail(
    email: string,
    name: string,
    token: string,
  ): Promise<boolean> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

    const html = this.getVerificationEmailTemplate(name, verificationUrl);

    return this.sendEmail({
      to: email,
      subject: 'Verify Your Email Address',
      html,
    });
  }

  async sendPasswordResetEmail(
    email: string,
    name: string,
    token: string,
  ): Promise<boolean> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    const html = this.getPasswordResetEmailTemplate(name, resetUrl);

    return this.sendEmail({
      to: email,
      subject: 'Reset Your Password',
      html,
    });
  }

  async sendPasswordChangedEmail(
    email: string,
    name: string,
  ): Promise<boolean> {
    const html = this.getPasswordChangedEmailTemplate(name);

    return this.sendEmail({
      to: email,
      subject: 'Password Changed Successfully',
      html,
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const html = this.getWelcomeEmailTemplate(name);

    return this.sendEmail({
      to: email,
      subject: 'Welcome to Project Cost Management',
      html,
    });
  }

  private getVerificationEmailTemplate(
    name: string,
    verificationUrl: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <tr>
                  <td style="padding: 40px 30px; text-align: center; background-color: #4CAF50; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Email Verification</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5; color: #333333;">
                      Hello ${name},
                    </p>
                    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5; color: #333333;">
                      Thank you for registering with Project Cost Management! To complete your registration, please verify your email address by clicking the button below:
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="${verificationUrl}" style="display: inline-block; padding: 14px 40px; background-color: #4CAF50; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 16px; font-weight: bold;">
                            Verify Email Address
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.5; color: #666666;">
                      If the button doesn't work, copy and paste this link into your browser:
                    </p>
                    <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.5; color: #4CAF50; word-break: break-all;">
                      ${verificationUrl}
                    </p>
                    <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #999999;">
                      If you didn't create an account, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 30px; text-align: center; background-color: #f9f9f9; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0; font-size: 12px; color: #999999;">
                      &copy; 2024 Project Cost Management. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  private getPasswordResetEmailTemplate(
    name: string,
    resetUrl: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <tr>
                  <td style="padding: 40px 30px; text-align: center; background-color: #FF9800; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Password Reset</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5; color: #333333;">
                      Hello ${name},
                    </p>
                    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5; color: #333333;">
                      We received a request to reset your password for your Project Cost Management account. Click the button below to reset your password:
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="${resetUrl}" style="display: inline-block; padding: 14px 40px; background-color: #FF9800; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 16px; font-weight: bold;">
                            Reset Password
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.5; color: #666666;">
                      If the button doesn't work, copy and paste this link into your browser:
                    </p>
                    <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.5; color: #FF9800; word-break: break-all;">
                      ${resetUrl}
                    </p>
                    <p style="margin: 0 0 10px; font-size: 14px; line-height: 1.5; color: #d32f2f; font-weight: bold;">
                      ⚠️ This link will expire in 1 hour.
                    </p>
                    <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #999999;">
                      If you didn't request a password reset, please ignore this email or contact support if you have concerns.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 30px; text-align: center; background-color: #f9f9f9; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0; font-size: 12px; color: #999999;">
                      &copy; 2024 Project Cost Management. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  private getPasswordChangedEmailTemplate(name: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Changed</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <tr>
                  <td style="padding: 40px 30px; text-align: center; background-color: #2196F3; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Password Changed</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5; color: #333333;">
                      Hello ${name},
                    </p>
                    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5; color: #333333;">
                      This is a confirmation that your password has been successfully changed for your Project Cost Management account.
                    </p>
                    <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.5; color: #666666;">
                      If you made this change, no further action is required.
                    </p>
                    <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #d32f2f; font-weight: bold;">
                      ⚠️ If you did not make this change, please contact our support team immediately.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 30px; text-align: center; background-color: #f9f9f9; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0; font-size: 12px; color: #999999;">
                      &copy; 2024 Project Cost Management. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  private getWelcomeEmailTemplate(name: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <tr>
                  <td style="padding: 40px 30px; text-align: center; background-color: #673AB7; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Welcome!</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5; color: #333333;">
                      Hello ${name},
                    </p>
                    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5; color: #333333;">
                      Welcome to Project Cost Management! Your email has been verified and your account is now active.
                    </p>
                    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5; color: #333333;">
                      You can now log in and start managing your projects effectively.
                    </p>
                    <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #666666;">
                      If you have any questions or need assistance, feel free to reach out to our support team.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 30px; text-align: center; background-color: #f9f9f9; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0; font-size: 12px; color: #999999;">
                      &copy; 2024 Project Cost Management. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
