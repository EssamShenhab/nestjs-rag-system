import { AppConfig } from './config.interface';

export default (): AppConfig => ({
  APP_NAME: process.env.APP_NAME!,
  APP_VERSION: process.env.APP_VERSION!,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY!,

  FILE_ALLOWED_TYPES: JSON.parse(process.env.FILE_ALLOWED_TYPES!),

  FILE_MAX_SIZE: parseInt(process.env.FILE_MAX_SIZE!, 10),

  FILE_DEFAULT_CHUNK_SIZE: parseInt(process.env.FILE_DEFAULT_CHUNK_SIZE!, 10),
});
