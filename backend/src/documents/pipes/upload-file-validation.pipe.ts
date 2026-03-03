import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from 'src/config/config.interface';
import { ResponseSignal } from 'src/models/enums';

@Injectable()
export class UploadFileValidationPipe implements PipeTransform {
  constructor(private readonly configService: ConfigService<AppConfig>) {}

  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException({
        signal: ResponseSignal.FILE_UPLOAD_FAILED,
      });
    }

    const maxSizeMB = this.configService.get<number>('FILE_MAX_SIZE', {
      infer: true,
    });

    if (!maxSizeMB) {
      throw new Error('FILE_MAX_SIZE is not defined');
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    const allowedTypes = this.configService.get<string[]>(
      'FILE_ALLOWED_TYPES',
      { infer: true },
    );

    if (!allowedTypes) {
      throw new Error('FILE_ALLOWED_TYPES is not defined');
    }

    if (file.size > maxSizeBytes) {
      throw new BadRequestException({
        signal: ResponseSignal.FILE_SIZE_EXCEEDED,
      });
    }

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException({
        signal: ResponseSignal.FILE_TYPE_NOT_SUPPORTED,
      });
    }

    return file;
  }
}
