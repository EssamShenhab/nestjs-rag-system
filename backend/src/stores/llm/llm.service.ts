import { Injectable } from '@nestjs/common';
import { LLMInterface } from './interfaces/llm-provider.interface';
import { LlmProviderFactory } from './factory/llm-provider.factory';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from 'src/config/config.interface';
import { OpenAIEnums } from './enums/llm.enums';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private generationClient: LLMInterface;
  private embeddingClient: LLMInterface;
  public readonly embedding_size: number;

  constructor(
    private readonly factory: LlmProviderFactory,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {
    this.generationClient = this.factory.create(
      this.configService.get('llm.GENERATION_BACKEND', { infer: true }),
    );

    this.embeddingClient = this.factory.create(
      this.configService.get('llm.EMBEDDING_BACKEND', { infer: true }),
    );

    this.generationClient.setGenerationModel(
      this.configService.get('llm.GENERATION_MODEL_ID', { infer: true }),
    );

    this.embeddingClient.setEmbeddingModel(
      this.configService.get('llm.EMBEDDING_MODEL_ID', { infer: true }),
      this.configService.get('llm.EMBEDDING_MODEL_SIZE', { infer: true }),
    );

    this.embedding_size = this.configService.get('llm.EMBEDDING_MODEL_SIZE', {
      infer: true,
    });
  }

  async embedText(
    text: string | string[],
    documentType?: string,
  ): Promise<number[][] | null> {
    return this.embeddingClient.embedText(text, documentType);
  }

  async generateText(
    prompt: string,
    chatHistory?: any[],
  ): Promise<string | null> {
    return this.generationClient.generateText(prompt, chatHistory);
  }

  processText(text: string): string {
    const max_chars = this.configService.get(
      'llm.INPUT_DEFAULT_MAX_CHARACTERS',
      { infer: true },
    );
    return text.slice(0, max_chars).trim();
  }

  constructPrompt(prompt: string, role: OpenAIEnums): any {
    return this.generationClient.constructPrompt(prompt, role);
  }
}
