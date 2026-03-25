import * as Joi from 'joi';

export const geminiValidation = {
  GEMINI_API_KEY: Joi.string()
    .optional()
    .allow('')
    .default('')
    .description('Google Gemini API key'),

  GEMINI_MODEL: Joi.string()
    .optional()
    .default('gemini-2.0-flash')
    .description('Gemini model to use'),
};
