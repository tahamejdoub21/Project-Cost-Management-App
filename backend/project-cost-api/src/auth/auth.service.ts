import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, ChangePasswordDto } from './dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 12;
  private readonly ACCESS_TOKEN_EXPIRY = '15m';
  private readonly REFRESH_TOKEN_EXPIRY = '7d';

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: dto.email,
        deletedAt: null,
      },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        role: UserRole.USER,
        profile:
          dto.position || dto.department
            ? {
                create: {
                  position: dto.position,
                  department: dto.department,
                },
              }
            : undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    await this.createAuditLog(
      user.id,
      'USER_REGISTERED',
      'User',
      user.id,
      null,
      {
        email: user.email,
        name: user.name,
      },
    );

    return {
      user,
      ...tokens,
    };
  }

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'Account is inactive. Please contact support.',
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    if (tokens.sessionToken) {
      await this.prisma.session.create({
        data: {
          userId: user.id,
          token: tokens.sessionToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          ipAddress,
          userAgent,
        },
      });
    }

    await this.createAuditLog(user.id, 'USER_LOGIN', 'User', user.id, null, {
      ipAddress,
      userAgent,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
      },
      ...tokens,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const tokenRecord = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (
        !tokenRecord ||
        tokenRecord.revoked ||
        tokenRecord.expiresAt < new Date()
      ) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      if (!tokenRecord.user.isActive || tokenRecord.user.deletedAt) {
        throw new UnauthorizedException('User account is inactive');
      }

      await this.prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { revoked: true },
      });

      const tokens = await this.generateTokens(
        tokenRecord.user.id,
        tokenRecord.user.email,
        tokenRecord.user.role,
      );

      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, sessionToken?: string) {
    if (sessionToken) {
      await this.prisma.session.deleteMany({
        where: {
          userId,
          token: sessionToken,
        },
      });
    }

    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revoked: false,
      },
      data: {
        revoked: true,
      },
    });

    await this.createAuditLog(
      userId,
      'USER_LOGOUT',
      'User',
      userId,
      null,
      null,
    );

    return { message: 'Logged out successfully' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, this.SALT_ROUNDS);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true },
    });

    await this.createAuditLog(
      userId,
      'PASSWORD_CHANGED',
      'User',
      userId,
      null,
      null,
    );

    return { message: 'Password changed successfully. Please login again.' };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        isActive: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            bio: true,
            position: true,
            department: true,
            skills: true,
            experience: true,
            hourlyRate: true,
            phone: true,
            location: true,
            website: true,
            socialLinks: true,
          },
        },
        userSettings: {
          select: {
            language: true,
            currency: true,
            timezone: true,
            dateFormat: true,
            theme: true,
            notifications: true,
            emailFrequency: true,
          },
        },
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  private async generateTokens(userId: string, email: string, role: UserRole) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
    });

    const sessionToken = this.jwtService.sign(
      { ...payload, type: 'session' },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.REFRESH_TOKEN_EXPIRY,
      },
    );

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      sessionToken,
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    };
  }

  private async createAuditLog(
    userId: string,
    action: string,
    entity: string,
    entityId: string,
    oldValues: any,
    newValues: any,
    ipAddress?: string,
    userAgent?: string,
  ) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          entity,
          entityId,
          oldValues: oldValues || undefined,
          newValues: newValues || undefined,
          ipAddress,
          userAgent,
        },
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }
}
