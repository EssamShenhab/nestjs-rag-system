import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TemplateParser } from './template-parser.service';
import { AppConfig } from 'src/config/config.interface';

@Module({
  providers: [
    {
      provide: TemplateParser,
      useFactory: (configService: ConfigService<AppConfig, true>) => {
        const language = configService.get('template.PRIMARY_LANG', {
          infer: true,
        });
        const default_language = configService.get('template.DEFAULT_LANG', {
          infer: true,
        });
        return new TemplateParser(language, default_language);
      },
      inject: [ConfigService],
    },
  ],
  exports: [TemplateParser],
})
export class TemplateModule {}
