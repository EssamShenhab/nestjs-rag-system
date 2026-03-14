import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VectorDBProviderFactory } from './factory/vectordb-provider.factory';
import { VectordbService } from './vectordb.service';

@Module({
  imports: [ConfigModule, TypeOrmModule],
  providers: [VectorDBProviderFactory, VectordbService],
  exports: [VectordbService],
})
export class VectorDBModule {}
