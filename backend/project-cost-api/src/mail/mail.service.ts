import { Injectable, Logger } from '@nestjs/common';
import * as brevo from '@getbrevo/brevo';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  tags?: string[];
  attachments?: Array<{
    content: string;
    name: string;
  }>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly apiInstance: brevo.TransactionalEmailsApi;
  private readonly fromEmail: string;
  private readonly fromName: string;
  private readonly isConfigured: boolean;
  private emailsSentCount = 0;
  private emailsFailedCount = 0;

  constructor() {
    const apiKey = process.env.BREVO_API_KEY || '';
    this.fromEmail = process.env.BREVO_FROM_EMAIL || '';
    this.fromName = process.env.BREVO_FROM_NAME || 'Project Cost Management';

    this.apiInstance = new brevo.TransactionalEmailsApi();

    if (!apiKey || !this.fromEmail) {
      this.logger.warn(
        'Brevo configuration is missing. Email functionality will not work.',
      );
      this.isConfigured = false;
    } else {
      this.apiInstance.setApiKey(
        brevo.TransactionalEmailsApiApiKeys.apiKey,
        apiKey,
      );
      this.isConfigured = true;
      this.logger.log('Brevo (Sendinblue) initialized successfully');
      this.logger.log(`Using sender: ${this.fromName} <${this.fromEmail}>`);
    }
  }

  isEmailConfigured(): boolean {
    return this.isConfigured;
  }

  getEmailStats() {
    return {
      configured: this.isConfigured,
      sent: this.emailsSentCount,
      failed: this.emailsFailedCount,
      fromEmail: this.fromEmail,
      fromName: this.fromName,
    };
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isConfigured) {
      this.logger.error('Brevo not configured - check API key and from email');
      this.emailsFailedCount++;
      return false;
    }

    try {
      const sendSmtpEmail = new brevo.SendSmtpEmail();
      sendSmtpEmail.sender = {
        name: this.fromName,
        email: this.fromEmail,
      };
      sendSmtpEmail.to = [{ email: options.to }];
      sendSmtpEmail.subject = options.subject;
      sendSmtpEmail.htmlContent = options.html;

      if (options.text) {
        sendSmtpEmail.textContent = options.text;
      }

      if (options.replyTo) {
        sendSmtpEmail.replyTo = { email: options.replyTo };
      }

      if (options.tags && options.tags.length > 0) {
        sendSmtpEmail.tags = options.tags;
      }

      if (options.attachments && options.attachments.length > 0) {
        sendSmtpEmail.attachment = options.attachments;
      }

      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);

      this.emailsSentCount++;
      this.logger.log(
        `Email sent successfully to ${options.to} (Message ID: ${result.body.messageId || 'unknown'})`,
      );
      return true;
    } catch (error) {
      this.emailsFailedCount++;
      const errorMessage = this.getErrorMessage(error);
      this.logger.error(
        `Failed to send email to ${options.to}: ${errorMessage}`,
      );
      return false;
    }
  }

  async sendEmailWithResult(options: EmailOptions): Promise<EmailResult> {
    if (!this.isConfigured) {
      this.logger.error('Brevo not configured - check API key and from email');
      this.emailsFailedCount++;
      return {
        success: false,
        error: 'Email service not configured',
      };
    }

    try {
      const sendSmtpEmail = new brevo.SendSmtpEmail();
      sendSmtpEmail.sender = {
        name: this.fromName,
        email: this.fromEmail,
      };
      sendSmtpEmail.to = [{ email: options.to }];
      sendSmtpEmail.subject = options.subject;
      sendSmtpEmail.htmlContent = options.html;

      if (options.text) {
        sendSmtpEmail.textContent = options.text;
      }

      if (options.replyTo) {
        sendSmtpEmail.replyTo = { email: options.replyTo };
      }

      if (options.tags && options.tags.length > 0) {
        sendSmtpEmail.tags = options.tags;
      }

      if (options.attachments && options.attachments.length > 0) {
        sendSmtpEmail.attachment = options.attachments;
      }

      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      const messageId = result.body.messageId || 'unknown';

      this.emailsSentCount++;
      this.logger.log(
        `Email sent successfully to ${options.to} (Message ID: ${messageId})`,
      );

      return {
        success: true,
        messageId,
      };
    } catch (error) {
      this.emailsFailedCount++;
      const errorMessage = this.getErrorMessage(error);
      this.logger.error(
        `Failed to send email to ${options.to}: ${errorMessage}`,
      );

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'object' && error !== null) {
      if ('response' in error && typeof error.response === 'object') {
        const response = error.response as {
          body?: { message?: string };
          text?: string;
        };
        if (response?.body?.message) {
          return response.body.message;
        }
        if (response?.text) {
          return response.text;
        }
      }
      return JSON.stringify(error);
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'Unknown error occurred';
  }

  async sendVerificationEmail(
    email: string,
    name: string,
    token: string,
  ): Promise<boolean> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

    const html = this.getVerificationEmailTemplate(name, verificationUrl);
    const text = `Hello ${name},

Thank you for registering with Project Cost Management!

To complete your registration, please verify your email address by clicking the link below:

${verificationUrl}

If you didn't create an account, you can safely ignore this email.

Best regards,
Project Cost Management Team

© 2024 Project Cost Management. All rights reserved.`;

    return this.sendEmail({
      to: email,
      subject: 'Verify Your Email Address - Project Cost Management',
      html,
      text,
      tags: ['verification', 'auth', 'onboarding'],
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
    const text = `Hello ${name},

We received a request to reset your password for your Project Cost Management account.

Click the link below to reset your password:

${resetUrl}

⚠️ This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email or contact support if you have concerns.

Best regards,
Project Cost Management Team

© 2024 Project Cost Management. All rights reserved.`;

    return this.sendEmail({
      to: email,
      subject: 'Reset Your Password - Project Cost Management',
      html,
      text,
      tags: ['password-reset', 'auth', 'security'],
    });
  }

  async sendPasswordChangedEmail(
    email: string,
    name: string,
  ): Promise<boolean> {
    const html = this.getPasswordChangedEmailTemplate(name);
    const text = `Hello ${name},

This is a confirmation that your password has been successfully changed for your Project Cost Management account.

If you made this change, no further action is required.

⚠️ If you did not make this change, please contact our support team immediately.

Best regards,
Project Cost Management Team

© 2024 Project Cost Management. All rights reserved.`;

    return this.sendEmail({
      to: email,
      subject: 'Password Changed Successfully - Project Cost Management',
      html,
      text,
      tags: ['password-changed', 'auth', 'security', 'notification'],
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const html = this.getWelcomeEmailTemplate(name);
    const text = `Hello ${name},

Welcome to Project Cost Management! Your email has been verified and your account is now active.

You can now log in and start managing your projects effectively.

If you have any questions or need assistance, feel free to reach out to our support team.

Best regards,
Project Cost Management Team

© 2024 Project Cost Management. All rights reserved.`;

    return this.sendEmail({
      to: email,
      subject: 'Welcome to Project Cost Management',
      html,
      text,
      tags: ['welcome', 'onboarding'],
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
}
