import { Module } from '@nestjs/common';
import { ChunkService } from './chunk.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chunk } from './entities/chunk.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Chunk])],
  providers: [ChunkService],
  exports: [ChunkService],
})
export class ChunkModule {}