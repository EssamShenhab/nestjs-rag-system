import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VectorDBEnums } from '../enums/vectordb.enums';
import { VectorDBInterface } from '../interfaces/vectordb-provider.interface';
import { QdrantProvider } from '../providers/qdrant.provider';
import { AppConfig } from 'src/config/config.interface';
// import { PGVectorProvider } from '../providers/pgvector.provider';

@Injectable()
export class VectorDBProviderFactory {
  constructor(
    private readonly configService: ConfigService<AppConfig, true>,
    // private readonly dataSource: DataSource,
  ) {}

  create(provider: string): VectorDBInterface {
    switch (provider) {
      case VectorDBEnums.QDRANT:
        return new QdrantProvider(this.configService);

      // case VectorDBEnums.PGVECTOR:
      //   return new PGVectorProvider(this.dataSource,this.configService);

      default:
        throw new Error(`Unsupported VectorDB provider: "${provider}"`);
    }
  }
}
