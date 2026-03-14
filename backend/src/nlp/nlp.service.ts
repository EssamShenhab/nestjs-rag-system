import { VectordbService } from 'src/stores/vectordb/vectordb.service';
import { LlmService } from 'src/stores/llm/llm.service';
import { Injectable } from '@nestjs/common';
import { Project } from 'src/project/entities/project.entity';
import { Chunk } from 'src/chunk/entities/chunk.entity';
import { DocumentTypeEnum, OpenAIEnums } from 'src/stores/llm/enums/llm.enums';
import { TemplateParser } from 'src/stores/prompts/templates/template-parser.service';
import { ProjectService } from 'src/project/project.service';
import { ChunkService } from 'src/chunk/chunk.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ResponseSignal } from 'src/models/enums/response-signal.enum';

@Injectable()
export class NlpService {
  constructor(
    private readonly vectordbService: VectordbService,
    private readonly llmService: LlmService,
    private readonly templateParser: TemplateParser,
    private readonly projectService: ProjectService,
    private readonly chunkService: ChunkService,
  ) {}

  createCollectionName(project_id: number): string {
    return `collection_${this.vectordbService.default_vector_size}_${project_id}`.trim();
  }

  async resetVectorDbCollection(project: Project): Promise<void> {
    const collectionName = this.createCollectionName(project.project_id);
    await this.vectordbService.deleteCollection(collectionName);
  }

  async getVectorDbCollectionInfo(project: Project): Promise<any> {
    const collectionName = this.createCollectionName(project.project_id);
    return this.vectordbService.getCollectionInfo(collectionName);
  }

  async indexIntoVectorDb(
    project: Project,
    chunks: Chunk[],
    chunk_ids: number[],
    do_reset = false,
  ): Promise<boolean> {
    // step 1: collection name
    const collectionName = this.createCollectionName(project.project_id);

    // step 2: extract texts, metadata, vectors
    const texts = chunks.map((c) => c.chunk_text);
    const metadata = chunks.map((c) => c.chunkMetadata);
    const vectors = await this.llmService.embedText(
      texts,
      DocumentTypeEnum.DOCUMENT,
    );

    if (!vectors) return false;

    // step 3: create collection if not exists
    await this.vectordbService.createCollection(
      collectionName,
      this.llmService.embedding_size,
      do_reset,
    );

    // step 4: insert into vector db
    await this.vectordbService.insertMany(
      collectionName,
      texts,
      vectors,
      metadata,
      chunk_ids,
    );

    return true;
  }

  async searchVectorDbCollection(
    project: Project,
    text: string,
    limit: number = 10,
  ): Promise<any> {
    // step 1: get collection name
    const collection_name = this.createCollectionName(project.project_id);

    // step 2: get text embedding vector
    const vectors = await this.llmService.embedText(
      text,
      DocumentTypeEnum.QUERY,
    );
    if (!vectors || vectors.length === 0) return false;

    const query_vector = vectors[0];

    // step 3: do semantic search
    const results = await this.vectordbService.searchByVector(
      collection_name,
      query_vector,
      limit,
    );
    if (!results) return false;

    return results;
  }

  async answerRagQuestion(
    project: Project,
    query: string,
    limit: number = 10,
  ): Promise<{
    answer: string | null;
    full_prompt: string | null;
    chat_history: any[] | null;
  }> {
    let answer: string | null = null;
    let full_prompt: string | null = null;
    let chat_history: any[] | null = null;

    // step 1: retrieve related documents
    const retrieved_documents = await this.searchVectorDbCollection(
      project,
      query,
      limit,
    );

    if (!retrieved_documents || retrieved_documents.length === 0) {
      return { answer, full_prompt, chat_history };
    }

    // step 2: construct LLM prompt
    const system_prompt = this.templateParser.get('rag', 'system_prompt');
    if (!system_prompt) return { answer, full_prompt, chat_history };

    const documents_prompt = retrieved_documents
      .map((doc: any, idx: number) =>
        this.templateParser.get('rag', 'document_prompt', {
          doc_num: idx + 1,
          chunk_text: this.llmService.processText(doc.text),
        }),
      )
      .join('\n');

    const footer_prompt = this.templateParser.get('rag', 'footer_prompt', {
      query,
    });

    // step 3: construct chat history
    chat_history = [
      this.llmService.constructPrompt(system_prompt, OpenAIEnums.SYSTEM),
    ];

    full_prompt = [documents_prompt, footer_prompt].join('\n\n');

    // step 4: retrieve the answer
    answer = await this.llmService.generateText(full_prompt, chat_history);

    return { answer, full_prompt, chat_history };
  }

  async indexProject(
    project_id: number,
    do_reset = 0,
  ): Promise<{ inserted_items_count: number }> {
    const project = await this.projectService.getProjectOrCreateOne(project_id);
    if (!project) {
      throw new HttpException(
        { signal: ResponseSignal.PROJECT_NOT_FOUND_ERROR },
        HttpStatus.BAD_REQUEST,
      );
    }

    let inserted_items_count = 0;
    let page_no = 1;

    while (true) {
      const page_chunks = await this.chunkService.getProjectChunks(
        project.project_id,
        page_no,
      );
      if (!page_chunks || page_chunks.length === 0) break;

      page_no++;
      const chunk_ids = page_chunks.map((c) => c.chunk_id);
      const is_inserted = await this.indexIntoVectorDb(
        project,
        page_chunks,
        chunk_ids,
        do_reset === 1,
      );

      if (!is_inserted) {
        throw new HttpException(
          { signal: ResponseSignal.INSERT_INTO_VECTORDB_ERROR },
          HttpStatus.BAD_REQUEST,
        );
      }

      inserted_items_count += page_chunks.length;
    }

    return { inserted_items_count };
  }

  async getProjectIndexInfo(project_id: number) {
    const project = await this.projectService.getProjectOrCreateOne(project_id);

    const collection_info = await this.getVectorDbCollectionInfo(project);

    return {
      signal: ResponseSignal.VECTORDB_COLLECTION_RETRIEVED,
      collection_info,
    };
  }

  async searchIndex(project_id: number, text: string, limit: number = 10) {
    const project = await this.projectService.getProjectOrCreateOne(project_id);

    const results = await this.searchVectorDbCollection(project, text, limit);

    if (!results) {
      throw new HttpException(
        { signal: ResponseSignal.VECTORDB_SEARCH_ERROR },
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      signal: ResponseSignal.VECTORDB_SEARCH_SUCCESS,
      results,
    };
  }

  async answerRag(project_id: number, text: string, limit: number = 10) {
    const project = await this.projectService.getProjectOrCreateOne(project_id);

    const { answer, full_prompt, chat_history } = await this.answerRagQuestion(
      project,
      text,
      limit,
    );

    if (!answer) {
      throw new HttpException(
        { signal: ResponseSignal.RAG_ANSWER_ERROR },
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      signal: ResponseSignal.RAG_ANSWER_SUCCESS,
      answer,
      full_prompt,
      chat_history,
    };
  }
}
