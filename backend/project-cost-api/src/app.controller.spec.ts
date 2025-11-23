import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { MailService } from './mail/mail.service';

describe('AppController', () => {
  let appController: AppController;

  const mockPrismaService = {
    $queryRaw: jest.fn(),
    user: {
      count: jest.fn(),
    },
  };

  const mockMailService = {
    getEmailStats: jest.fn().mockReturnValue({
      configured: true,
      sent: 0,
      failed: 0,
      fromEmail: 'test@example.com',
      fromName: 'Test',
    }),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return API status message', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
      mockPrismaService.user.count.mockResolvedValue(5);

      const result = await appController.getHello();
      expect(result).toContain('Project Cost Management API is running!');
      expect(result).toContain('Users: 5');
    });
  });

  describe('health/email', () => {
    it('should return email health status', () => {
      const result = appController.getEmailHealth();
      expect(result).toHaveProperty('service', 'email');
      expect(result).toHaveProperty('configured', true);
      expect(result).toHaveProperty('timestamp');
    });
  });
});
