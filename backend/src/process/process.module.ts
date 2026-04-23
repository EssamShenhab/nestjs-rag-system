import { Module } from '@nestjs/common';
import { ProcessService } from './process.service';
import { ProcessController } from './process.controller';
import { ProjectModule } from 'src/project/project.module';
import { ChunkModule } from 'src/chunk/chunk.module';
import { AssetModule } from 'src/asset/asset.module';
import { NlpModule } from 'src/nlp/nlp.module';
import { BullModule } from '@nestjs/bullmq';
import { FlowModule } from 'src/flow/flow.module';

@Module({
  imports: [
    ProjectModule,
    ChunkModule,
    AssetModule,
    NlpModule,
    FlowModule,
    BullModule.registerQueue({
      name: 'tasks.file_processing.process_project_files',
    }),
  ],
  controllers: [ProcessController],
  providers: [ProcessService],
  exports: [ProcessService],
})
export class ProcessModule {}
