import { Module } from '@nestjs/common';
import { ProcessService } from './process.service';
import { ProcessController } from './process.controller';
import { ProjectModule } from 'src/project/project.module';
import { ChunkModule } from 'src/chunk/chunk.module';
import { AssetModule } from 'src/asset/asset.module';
import { NlpModule } from 'src/nlp/nlp.module';

@Module({
  imports: [ProjectModule, ChunkModule, AssetModule, NlpModule],
  controllers: [ProcessController],
  providers: [ProcessService],
})
export class ProcessModule {}
