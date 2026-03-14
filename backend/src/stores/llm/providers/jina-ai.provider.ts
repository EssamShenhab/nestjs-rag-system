import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { LLMInterface } from '../interfaces/llm-provider.interface';
import { ConfigService } from '@nestjs/config';
import { OpenAIEnums } from '../enums/llm.enums';
import { NotImplementedException } from '@nestjs/common';

@Injectable()
export class JinaAIProvider implements LLMInterface {
  private readonly logger = new Logger(JinaAIProvider.name);

  private client: OpenAI;

  private generation_model_id: string | null = null;
  private embedding_model_id: string | null = null;
  private embedding_size: number;

  private default_input_max_characters: number;
  private default_generation_max_output_tokens: number;
  private default_generation_temperature: number;

  constructor(private configService: ConfigService) {
    const api_key = this.configService.get<string>('llm.JINA_API_KEY');

    this.default_input_max_characters =
      this.configService.get<number>('llm.INPUT_DEFAULT_MAX_CHARACTERS') ??
      1000;

    this.default_generation_max_output_tokens =
      this.configService.get<number>('llm.GENERATION_DEFAULT_MAX_TOKENS') ??
      1000;

    this.default_generation_temperature =
      this.configService.get<number>('llm.GENERATION_DEFAULT_TEMPERATURE') ??
      0.1;

    this.client = new OpenAI({
      apiKey: api_key,
      baseURL: 'https://api.jina.ai/v1',
    });
  }

  setGenerationModel(model_id: string): void {
    this.generation_model_id = model_id;
    this.logger.warn('JinaProvider does not support text generation');
  }

  setEmbeddingModel(model_id: string, embedding_size: number): void {
    this.embedding_model_id = model_id;
    this.embedding_size = embedding_size;
  }

  async generateText(
    prompt: string,
    chat_history?: ChatCompletionMessageParam[],
    max_output_tokens?: number,
    temperature?: number,
  ): Promise<string | null> {
    this.logger.error('JinaProvider does not support text generation');
    throw new NotImplementedException('JinaProvider supports embeddings only');
  }

  async embedText(
    text: string | string[],
    document_type?: string,
  ): Promise<number[][] | null> {
    if (!this.client) {
      this.logger.error('OpenAI client is not initialized');
      return null;
    }

    if (!this.embedding_model_id) {
      this.logger.error('OpenAI embedding model id is not set');
      return null;
    }

    if (typeof text === 'string') {
      text = [text];
    }

    try {
      const response = await this.client.embeddings.create({
        model: this.embedding_model_id,
        input: text,
      });

      if (!response?.data?.length || !response.data[0]?.embedding) {
        this.logger.error('Error while embedding text with OpenAI');
        return null;
      }

      return response.data.map((item) => item.embedding);
    } catch (error) {
      this.logger.error('Embedding failed', error);
      return null;
    }
  }

  constructPrompt(
    prompt: string,
    role: OpenAIEnums,
  ): ChatCompletionMessageParam {
    return {
      role,
      content: prompt,
    };
  }
}
