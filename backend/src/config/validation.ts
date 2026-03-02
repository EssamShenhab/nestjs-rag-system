import * as Joi from 'joi';

export const validationSchema = Joi.object({
  APP_NAME: Joi.string().required(),

  APP_VERSION: Joi.string().required(),

  OPENAI_API_KEY: Joi.string().required(),

  FILE_ALLOWED_TYPES: Joi.string()
    .custom((value) => {
      JSON.parse(value);
      return value;
    })
    .required(),

  FILE_MAX_SIZE: Joi.number().required(),

  FILE_DEFAULT_CHUNK_SIZE: Joi.number().required(),
});
