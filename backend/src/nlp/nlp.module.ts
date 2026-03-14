import { Module } from '@nestjs/common';
import { NlpService } from './nlp.service';
import { NlpController } from './nlp.controller';
import { VectorDBModule } from 'src/stores/vectordb/vectordb.module';
import { LlmModule } from 'src/stores/llm/llm.module';
import { TemplateModule } from 'src/stores/prompts/templates/template-parser.module';
import { ProjectModule } from 'src/project/project.module';
import { ChunkModule } from 'src/chunk/chunk.module';

@Module({
  imports: [VectorDBModule, LlmModule, TemplateModule, ProjectModule, ChunkModule],
  controllers: [NlpController],
  providers: [NlpService],
  exports: [NlpService],
})
export class NlpModule {}
