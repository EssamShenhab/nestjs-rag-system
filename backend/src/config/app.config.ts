import { AppConfig } from './config.interface';

export default (): AppConfig => ({
  APP_NAME: process.env.APP_NAME!,
  APP_VERSION: process.env.APP_VERSION!,

  FILE_ALLOWED_TYPES: JSON.parse(process.env.FILE_ALLOWED_TYPES!),

  FILE_MAX_SIZE: parseInt(process.env.FILE_MAX_SIZE!, 10),

  FILE_DEFAULT_CHUNK_SIZE: parseInt(process.env.FILE_DEFAULT_CHUNK_SIZE!, 10),

  db: {
    host: process.env.DB_HOST!,
    username: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
  },

  llm: {
    GENERATION_BACKEND: process.env.GENERATION_BACKEND!,
    EMBEDDING_BACKEND: process.env.EMBEDDING_BACKEND!,

    OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
    COHERE_API_KEY: process.env.COHERE_API_KEY!,
    JINA_AI_API_KEY: process.env.JINA_AI_API_KEY!,
    OPENAI_API_URL: process.env.OPENAI_API_URL!,

    GENERATION_MODEL_ID_LITERAL: JSON.parse(
      process.env.GENERATION_MODEL_ID_LITERAL ?? '[]',
    ),

    GENERATION_MODEL_ID: process.env.GENERATION_MODEL_ID!,
    EMBEDDING_MODEL_ID: process.env.EMBEDDING_MODEL_ID!,
    EMBEDDING_MODEL_SIZE: parseInt(process.env.EMBEDDING_MODEL_SIZE ?? '0', 10),

    INPUT_DEFAULT_MAX_CHARACTERS: parseInt(
      process.env.INPUT_DEFAULT_MAX_CHARACTERS ?? '0',
      10,
    ),

    GENERATION_DEFAULT_MAX_TOKENS: parseInt(
      process.env.GENERATION_DEFAULT_MAX_TOKENS ?? '0',
      10,
    ),

    GENERATION_DEFAULT_TEMPERATURE: parseFloat(
      process.env.GENERATION_DEFAULT_TEMPERATURE ?? '0',
    ),
  },

  vectordb: {
    VECTOR_DB_BACKEND_LITERAL: JSON.parse(
      process.env.VECTOR_DB_BACKEND_LITERAL ?? '[]',
    ),

    VECTOR_DB_BACKEND: process.env.VECTOR_DB_BACKEND!,
    VECTOR_DB_PATH: process.env.VECTOR_DB_PATH!,
    VECTOR_DB_DISTANCE_METHOD: process.env.VECTOR_DB_DISTANCE_METHOD!,

    QDRANT_HOST: process.env.QDRANT_HOST!,
    QDRANT_PORT: parseInt(process.env.QDRANT_PORT!, 10),

    VECTOR_DB_PGVEC_INDEX_THRESHOLD: parseInt(
      process.env.VECTOR_DB_PGVEC_INDEX_THRESHOLD ?? '0',
      10,
    ),
    
  },

  template: {
    PRIMARY_LANG: process.env.PRIMARY_LANG!,
    DEFAULT_LANG: process.env.DEFAULT_LANG!,
  },

  bullmq: {
    BULLMQ_HOST: process.env.BULLMQ_HOST!,
    BULLMQ_PORT: parseInt(process.env.BULLMQ_PORT!, 10),
    BULLMQ_PASSWORD: process.env.BULLMQ_PASSWORD!,
    BULLMQ_TASK_TIME_LIMIT: parseInt(process.env.BULLMQ_TASK_TIME_LIMIT!, 10),
    BULLMQ_CONCURRENCY: parseInt(process.env.BULLMQ_CONCURRENCY!, 10),
    BULLMQ_TASK_REMOVE_ON_COMPLETE: process.env.BULLMQ_TASK_REMOVE_ON_COMPLETE!,
    BULLMQ_TASK_REMOVE_ON_FAIL: process.env.BULLMQ_TASK_REMOVE_ON_FAIL!,
  },
});
