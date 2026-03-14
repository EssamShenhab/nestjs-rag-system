import { Module } from '@nestjs/common';
import { LlmProviderFactory } from './factory/llm-provider.factory';
import { OpenAIProvider } from './providers/openai.provider';
import { JinaAIProvider } from './providers/jina-ai.provider';
import { LlmService } from './llm.service';

@Module({
  providers: [LlmProviderFactory, OpenAIProvider, JinaAIProvider, LlmService],
  exports: [LlmService],
})
export class LlmModule {}
