import { VectorDBInterface } from '../interfaces/vectordb-provider.interface';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DistanceMethodEnums } from '../enums/vectordb.enums';
import { QdrantClient, Schemas } from '@qdrant/js-client-rest';
import { v4 as uuidv4 } from 'uuid';
import { AppConfig } from 'src/config/config.interface';

@Injectable()
export class QdrantProvider implements VectorDBInterface {
  private readonly logger = new Logger(QdrantProvider.name);
  private client: QdrantClient | null = null;

  private readonly host: string;
  private readonly port: number;
  private readonly distance_method: string;
  readonly default_vector_size: number;

  constructor(private readonly configService: ConfigService<AppConfig, true>) {
    this.host = this.configService.get('vectordb.QDRANT_HOST', { infer: true });
    this.port = this.configService.get('vectordb.QDRANT_PORT', { infer: true });
    this.default_vector_size = this.configService.get(
      'llm.EMBEDDING_MODEL_SIZE',
      { infer: true },
    );

    const method = this.configService.get(
      'vectordb.VECTOR_DB_DISTANCE_METHOD',
      { infer: true },
    );
    this.distance_method =
      method === DistanceMethodEnums.DOT
        ? DistanceMethodEnums.DOT
        : DistanceMethodEnums.COSINE;
  }

  async connect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.getCollections();
        return; // already reachable
      } catch {
        this.logger.warn('Existing Qdrant client unreachable. Reconnecting...');
        this.client = null;
      }
    }

    this.client = new QdrantClient({ host: this.host, port: this.port });

    try {
      await this.client.getCollections();
      this.logger.log(`Connected to Qdrant at ${this.host}:${this.port}`);
    } catch (err) {
      this.client = null;
      throw new Error(
        `Failed to connect to Qdrant at ${this.host}:${this.port} — ${err}`,
      );
    }
  }

  async disconnect(): Promise<void> {
    this.client = null;
    this.logger.log('Disconnected from Qdrant');
  }

  async isCollectionExisted(collection_name: string): Promise<boolean> {
    if (!this.client) {
      throw new Error('Qdrant client is not connected');
    }
    try {
      await this.client.getCollection(collection_name);
      return true;
    } catch (err: any) {
      if (err?.status === 404 || err?.message?.includes('Not found'))
        return false;
      throw err;
    }
  }

  async listAllCollections(): Promise<string[]> {
    if (!this.client) {
      throw new Error('Qdrant client is not connected');
    }

    const { collections } = await this.client.getCollections();

    return collections.map((c) => c.name);
  }

  async getCollectionInfo(collection_name: string): Promise<any> {
    if (!this.client) {
      throw new Error('Qdrant client is not connected');
    }

    return this.client.getCollection(collection_name);
  }

  async deleteCollection(collection_name: string): Promise<void> {
    if (!this.client) {
      throw new Error('Qdrant client is not connected');
    }

    const exists = await this.isCollectionExisted(collection_name);
    if (exists) {
      this.logger.log(`Deleting collection: ${collection_name}`);
      await this.client.deleteCollection(collection_name);
    }
  }

  async createCollection(
    collection_name: string,
    embedding_size: number,
    do_reset = false,
  ): Promise<boolean> {
    if (!this.client) {
      throw new Error('Qdrant client is not connected');
    }

    if (do_reset) {
      await this.deleteCollection(collection_name);
    }

    const exists = await this.isCollectionExisted(collection_name);

    if (!exists) {
      this.logger.log(`Creating new Qdrant collection: ${collection_name}`);
      await this.client.createCollection(collection_name, {
        vectors: {
          size: embedding_size,
          distance: this.distance_method as Schemas['Distance'],
        },
        quantization_config: {
          scalar: {
            type: 'int8',
            always_ram: true,
          },
        },
      });

      return true;
    }

    return false;
  }

  async insertOne(
    collection_name: string,
    text: string,
    vector: number[],
    metadata?: any,
    record_id?: string,
  ): Promise<boolean> {
    if (!this.client) throw new Error('Qdrant client is not connected');

    const exists = await this.isCollectionExisted(collection_name);
    if (!exists) {
      this.logger.error(
        `Cannot insert record to non-existing collection: ${collection_name}`,
      );
      return false;
    }

    const id = record_id ?? uuidv4();

    try {
      await this.client.upsert(collection_name, {
        points: [{ id, vector, payload: { text, metadata: metadata ?? null } }],
      });
      return true;
    } catch (err) {
      this.logger.error(`insertOne failed: ${err}`);
      return false;
    }
  }

  async insertMany(
    collection_name: string,
    texts: string[],
    vectors: number[][],
    metadata?: any[],
    record_ids?: number[],
    batch_size = 50,
  ): Promise<boolean> {
    if (!this.client) {
      throw new Error('Qdrant client is not connected');
    }

    const exists = await this.isCollectionExisted(collection_name);

    if (!exists) {
      this.logger.error(`Collection does not exist: ${collection_name}`);
      return false;
    }

    if (!metadata) {
      metadata = new Array(texts.length).fill(null);
    }

    if (!record_ids) {
      record_ids = texts.map((_, i) => Date.now() + i);
    }

    for (let i = 0; i < texts.length; i += batch_size) {
      const batch_texts = texts.slice(i, i + batch_size);
      const batch_vectors = vectors.slice(i, i + batch_size);
      const batch_metadata = metadata.slice(i, i + batch_size);
      const batch_ids = record_ids!.slice(i, i + batch_size);

      const points = batch_texts.map((text, idx) => ({
        id: Number(batch_ids[idx]),
        vector: batch_vectors[idx],
        payload: {
          text,
          metadata: batch_metadata[idx],
        },
      }));

      try {
        await this.client.upsert(collection_name, { points });
      } catch (err) {
        this.logger.error(`Batch insert error: ${err}`);
        return false;
      }
    }

    return true;
  }

  async searchByVector(
    collection_name: string,
    vector: number[],
    limit = 5,
  ): Promise<any[]> {
    if (!this.client) throw new Error('Qdrant client is not connected');

    const results = await this.client.search(collection_name, {
      vector,
      params: {
        hnsw_ef: 128,
        exact: false,
      },
      limit,
      with_payload: true,
    });

    return (results ?? []).map((r) => ({
      score: r.score,
      text: r.payload?.text ?? '',
    }));
  }
}
