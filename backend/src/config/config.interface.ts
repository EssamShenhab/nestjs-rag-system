export interface AppConfig {
  APP_NAME: string;
  APP_VERSION: string;
  OPENAI_API_KEY: string;

  FILE_ALLOWED_TYPES: string[];
  FILE_MAX_SIZE: number;
  FILE_DEFAULT_CHUNK_SIZE: number;

  db: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
}
