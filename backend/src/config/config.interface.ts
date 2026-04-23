export interface AppConfig {
  APP_NAME: string;
  APP_VERSION: string;

  FILE_ALLOWED_TYPES: string[];
  FILE_MAX_SIZE: number;
  FILE_DEFAULT_CHUNK_SIZE: number;

  db: {
    host: string;
    username: string;
    password: string;
    database: string;
  };

  llm: {
    GENERATION_BACKEND: string;
    EMBEDDING_BACKEND: string;

    OPENAI_API_KEY: string;
    COHERE_API_KEY: string;
    JINA_AI_API_KEY: string;
    OPENAI_API_URL: string;

    GENERATION_MODEL_ID_LITERAL: string[] | null;
    GENERATION_MODEL_ID: string;
    EMBEDDING_MODEL_ID: string;
    EMBEDDING_MODEL_SIZE: number;

    INPUT_DEFAULT_MAX_CHARACTERS: number;
    GENERATION_DEFAULT_MAX_TOKENS: number;
    GENERATION_DEFAULT_TEMPERATURE: number;
  };

  vectordb: {
    VECTOR_DB_BACKEND_LITERAL: string[];
    VECTOR_DB_BACKEND: string;
    VECTOR_DB_PATH: string;
    VECTOR_DB_DISTANCE_METHOD: string;

    QDRANT_HOST: string;
    QDRANT_PORT: number;

    VECTOR_DB_PGVEC_INDEX_THRESHOLD: number;

    
  };

  template: {
    PRIMARY_LANG: string;
    DEFAULT_LANG: string;
  };

  bullmq: {
    BULLMQ_HOST: string;
    BULLMQ_PORT: number;
    BULLMQ_PASSWORD: string;
    BULLMQ_TASK_TIME_LIMIT: number;
    BULLMQ_CONCURRENCY: number;
    BULLMQ_TASK_REMOVE_ON_COMPLETE: any;
    BULLMQ_TASK_REMOVE_ON_FAIL: any;
  },
}
