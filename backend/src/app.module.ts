import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DocumentsModule } from './documents/documents.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/app.config';
import { validationSchema } from './config/validation';
import { ProcessModule } from './process/process.module';
import { ProjectModule } from './project/project.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChunkModule } from './chunk/chunk.module';
import { AssetModule } from './asset/asset.module';
import { VectorDBModule } from './stores/vectordb/vectordb.module';
import { NlpModule } from './nlp/nlp.module';
import { TemplateModule } from './stores/prompts/templates/template-parser.module'; 

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema,
      load: [configuration],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('db.host'),
        port: config.get<number>('db.port'),
        username: config.get<string>('db.username'),
        password: config.get<string>('db.password'),
        database: config.get<string>('db.database'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),

    ProjectModule,
    DocumentsModule,
    ProcessModule,
    ChunkModule,
    AssetModule,
    VectorDBModule,
    NlpModule,
    TemplateModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
