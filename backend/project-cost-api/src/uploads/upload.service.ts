import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const unlinkAsync = promisify(fs.unlink);
const mkdirAsync = promisify(fs.mkdir);

@Injectable()
export class UploadService {
  private readonly uploadDir: string;
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  private readonly allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

  constructor(private configService: ConfigService) {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.ensureUploadDirectory();
  }

  private async ensureUploadDirectory() {
    const dirs = [
      this.uploadDir,
      path.join(this.uploadDir, 'avatars'),
      path.join(this.uploadDir, 'projects'),
      path.join(this.uploadDir, 'tasks'),
      path.join(this.uploadDir, 'temp'),
    ];

    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        await mkdirAsync(dir, { recursive: true });
      }
    }
  }

  validateImageFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, and WebP images are allowed',
      );
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.maxFileSize / (1024 * 1024)}MB`,
      );
    }

    return true;
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      const fullPath = path.join(process.cwd(), filePath);
      if (fs.existsSync(fullPath)) {
        await unlinkAsync(fullPath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  getFileUrl(filePath: string): string {
    return `/${filePath.replace(/\\/g, '/')}`;
  }

  sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase();
  }

  generateUniqueFilename(originalFilename: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(originalFilename);
    const nameWithoutExt = path.basename(originalFilename, ext);
    const sanitizedName = this.sanitizeFilename(nameWithoutExt);

    return `${sanitizedName}-${timestamp}-${random}${ext}`;
  }

  getUploadPath(type: 'avatars' | 'projects' | 'tasks' | 'temp'): string {
    return path.join(this.uploadDir, type);
  }
}
