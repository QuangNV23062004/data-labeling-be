import { registerAs } from '@nestjs/config';
import { GeminiConfig } from 'src/interfaces/configs/gemini.interface';

export const geminiConfig = registerAs(
  'gemini',
  (): GeminiConfig => ({
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  }),
);
