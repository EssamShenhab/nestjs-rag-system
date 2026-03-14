export interface LLMInterface {
  setGenerationModel(model_id: string): void;

  setEmbeddingModel(model_id: string, embedding_size: number): void;
  
  generateText(
    prompt: string,
    chat_history?: any,
    max_output_tokens?: number,
    temperature?: number,
  ): Promise<string | null>;

  embedText(
    text: string | string[],
    document_type?: string,
  ): Promise<number[][] | null>;

  constructPrompt(prompt: string, role: string): any;
}
