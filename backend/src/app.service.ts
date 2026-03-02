import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from './config/config.interface';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService<AppConfig>) {}

  async getHello() {
    const appName = this.configService.get('APP_NAME', { infer: true });
    const appVersion = this.configService.get('APP_VERSION', { infer: true });

    if (!appName) {
      throw new Error('APP_NAME is not defined');
    }

    if (!appVersion) {
      throw new Error('APP_VERSION is not defined');
    }

    return {
      app_name: appName,
      app_version: appVersion,
    };
  }
}
