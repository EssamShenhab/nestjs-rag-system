import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chunk } from './entities/chunk.entity';

@Injectable()
export class ChunkService {
  constructor(
    @InjectRepository(Chunk)
    private readonly chunkRepo: Repository<Chunk>,
  ) {}

  async createChunk(chunk: Partial<Chunk>): Promise<Chunk> {
    const entity = this.chunkRepo.create(chunk);
    return this.chunkRepo.save(entity);
  }

  async getChunk(chunk_id: number): Promise<Chunk | null> {
    return this.chunkRepo.findOne({
      where: { chunk_id: chunk_id },
    });
  }

  async insertManyChunks(chunks: Partial<Chunk>[]): Promise<number> {
    const entities = this.chunkRepo.create(chunks);
    await this.chunkRepo.save(entities);
    return entities.length;
  }

  async deleteChunksByProjectId(project_id: number): Promise<number> {
    const result = await this.chunkRepo.delete({
      chunk_project_id: project_id,
    });

    return result.affected ?? 0;
  }

  async getProjectChunks(
    project_id: number,
    page_no: number = 1,
    page_size: number = 50,
  ): Promise<Chunk[]> {
    return this.chunkRepo.find({
      where: { chunk_project_id: project_id },
      skip: (page_no - 1) * page_size,
      take: page_size,
      order: { chunk_order: 'ASC' },
    });
  }

  async getTotalChunksCount(project_id: number): Promise<number> {
    return this.chunkRepo.count({
      where: { chunk_project_id: project_id },
    });
  }
}
