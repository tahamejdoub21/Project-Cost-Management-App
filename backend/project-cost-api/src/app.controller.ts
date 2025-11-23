import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MailService } from './mail/mail.service';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly mailService: MailService,
  ) {}

  @Public()
  @Get()
  async getHello(): Promise<string> {
    return await this.appService.getHello();
  }

  @Public()
  @Get('health/email')
  getEmailHealth() {
    return {
      service: 'email',
      ...this.mailService.getEmailStats(),
      timestamp: new Date().toISOString(),
    };
  }
}
