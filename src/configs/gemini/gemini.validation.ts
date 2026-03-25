import * as Joi from 'joi';

export const geminiValidation = {
  GEMINI_API_KEY: Joi.string()
    .required()
    .description('Google Gemini API key')
    .error(new Error('GEMINI_API_KEY is required')),

  GEMINI_MODEL: Joi.string()
    .optional()
    .default('gemini-2.0-flash')
    .description('Gemini model to use'),
};
