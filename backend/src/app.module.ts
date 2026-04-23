import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
import { MetricsModule } from './utils/metrics/metrics.module';
import { PrometheusMiddleware } from './utils/metrics/metrics.middleware';
import { BullModule } from '@nestjs/bullmq';
import { FileProcessingModule } from './tasks/file-processing/file-processing.module';
import { DataIndexingModule } from './tasks/data-indexing/data-indexing.module';
import { FlowModule } from './flow/flow.module';

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
        synchronize: false,
      }),
    }),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        connection: {
          host: config.get<string>('bullmq.BULLMQ_HOST'),
          port: config.get<number>('bullmq.BULLMQ_PORT'),
          password: config.get<string>('bullmq.BULLMQ_PASSWORD'),
        },
        defaultJobOptions: {
          attempts: 3,
          removeOnComplete: config.get('bullmq.BULLMQ_TASK_REMOVE_ON_COMPLETE'),
          removeOnFail: config.get('bullmq.BULLMQ_TASK_REMOVE_ON_FAIL'),
          backoff: {
            type: 'fixed',
            delay: 1000,
          },
        },
      }),
      inject: [ConfigService],
    }),

    BullModule.registerQueue({
      name: 'video',
    }),

    ProjectModule,
    DocumentsModule,
    ProcessModule,
    ChunkModule,
    AssetModule,
    VectorDBModule,
    NlpModule,
    TemplateModule,
    MetricsModule,
    FileProcessingModule,
    DataIndexingModule,
    FlowModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PrometheusMiddleware).forRoutes('*');
  }
}
