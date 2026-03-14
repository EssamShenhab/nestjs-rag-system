import { Injectable } from '@nestjs/common';
import { LLMInterface } from '../interfaces/llm-provider.interface';
import { LLMEnums } from '../enums/llm.enums';
import { OpenAIProvider } from '../providers/openai.provider';
import { JinaAIProvider } from '../providers/jina-ai.provider';


@Injectable()
export class LlmProviderFactory {

  constructor(
    private readonly openaiProvider: OpenAIProvider,
    private readonly jinaProvider: JinaAIProvider,
  ) {}

  create(provider: LLMEnums): LLMInterface {

    switch (provider) {

      case LLMEnums.OPENAI:
        return this.openaiProvider;

      case LLMEnums.JINA_AI:
        return this.jinaProvider;

      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
}