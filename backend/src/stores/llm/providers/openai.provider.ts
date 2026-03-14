import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { LLMInterface } from '../interfaces/llm-provider.interface';
import { ConfigService } from '@nestjs/config';
import { OpenAIEnums } from '../enums/llm.enums';

@Injectable()
export class OpenAIProvider implements LLMInterface {
  private readonly logger = new Logger(OpenAIProvider.name);

  private client: OpenAI;

  private generation_model_id: string | null = null;
  private embedding_model_id: string | null = null;
  private embedding_size: number | null = null;

  private default_input_max_characters: number;
  private default_generation_max_output_tokens: number;
  private default_generation_temperature: number;

  constructor(private configService: ConfigService) {
    const api_key = this.configService.get<string>('llm.OPENAI_API_KEY');
    const api_url = this.configService.get<string>('llm.OPENAI_API_URL');

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
      baseURL: api_url || undefined,
    });
  }

  setGenerationModel(model_id: string): void {
    this.generation_model_id = model_id;
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
    if (!this.client) {
      this.logger.error('OpenAI client is not initialized');
      return null;
    }

    if (!this.generation_model_id) {
      this.logger.error('OpenAI generation model id is not set');
      return null;
    }

    max_output_tokens =
      max_output_tokens ?? this.default_generation_max_output_tokens;

    temperature = temperature ?? this.default_generation_temperature;

    const messages: ChatCompletionMessageParam[] = [
      ...(chat_history ?? []),
      this.constructPrompt(prompt, OpenAIEnums.USER),
    ];

    try {
      const response = await this.client.chat.completions.create({
        model: this.generation_model_id,
        messages,
        max_tokens: max_output_tokens,
        temperature,
      });

      if (!response?.choices?.length || !response.choices[0]?.message) {
        this.logger.error('Error while generating text with OpenAI');
        return null;
      }

      return response.choices[0].message.content;
    } catch (error) {
      this.logger.error('OpenAI generation failed', error);
      return null;
    }
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
