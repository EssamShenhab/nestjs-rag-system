import { NlpService } from 'src/nlp/nlp.service';
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VectorDBProviderFactory } from './factory/vectordb-provider.factory';
import { VectorDBInterface } from './interfaces/vectordb-provider.interface';
import { AppConfig } from 'src/config/config.interface';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class VectordbService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(VectordbService.name);
  private client: VectorDBInterface;
  public readonly default_vector_size: number;

  protected baseDir: string;
  protected databaseDir: string;

  constructor(
    private readonly factory: VectorDBProviderFactory,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {
    this.baseDir = process.cwd();
    this.databaseDir = path.join(this.baseDir, 'src', 'assets', 'database');
    this.default_vector_size = this.configService.get(
      'llm.EMBEDDING_MODEL_SIZE',
      { infer: true },
    );
  }

  async onModuleInit() {
    const provider = this.configService.get('vectordb.VECTOR_DB_BACKEND', {
      infer: true,
    });
    this.client = this.factory.create(provider);
    await this.client.connect();
    this.logger.log('VectorDB connected');
  }

  async onModuleDestroy() {
    await this.client.disconnect();
    this.logger.log('VectorDB disconnected');
  }

  async deleteCollection(collectionName: string): Promise<void> {
    return this.client.deleteCollection(collectionName);
  }

  async createCollection(
    collectionName: string,
    embeddingSize: number,
    doReset = false,
  ): Promise<boolean> {
    return this.client.createCollection(collectionName, embeddingSize, doReset);
  }

async insertMany(
  collectionName: string,
  texts: string[],
  vectors: number[][],
  metadata?: any[],
  record_ids?: number[],
): Promise<boolean> {
  return this.client.insertMany(collectionName, texts, vectors, metadata, record_ids);
}

  async searchByVector(
    collection_name: string,
    vector: number[],
    limit = 5,
  ): Promise<any[]> {
    return this.client.searchByVector(collection_name, vector, limit);
  }

  async getDatabasePath(dbName: string): Promise<string> {
    const databasePath = path.join(this.databaseDir, dbName);
    await fs.mkdir(databasePath, { recursive: true });
    return databasePath;
  }

  async getCollectionInfo(collection_name: string): Promise<any> {
    return this.client.getCollectionInfo(collection_name);
  }
}
