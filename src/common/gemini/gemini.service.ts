import { Injectable, Logger, InternalServerErrorException, ServiceUnavailableException } from '@nestjs/common';
import {
  GoogleGenerativeAI,
  GenerativeModel,
  Part,
} from '@google/generative-ai';
import { TypedConfigService } from '../typed-config/typed-config.service';
import { LabelEntity } from 'src/modules/label/label.entity';

export interface GeminiLabelSuggestion {
  labelId: string | null;
  labelName: string | null;
  confidence: number;
  reasoning: string;
}

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private model: GenerativeModel | null = null;

  constructor(private readonly typedConfigService: TypedConfigService) {
    const { apiKey, model } = this.typedConfigService.gemini;
    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      this.model = genAI.getGenerativeModel({ model });
    } else {
      this.logger.warn(
        'GEMINI_API_KEY is not set. Gemini label suggestions will be unavailable.',
      );
    }
  }

  async suggestLabel(
    fileBuffer: Buffer,
    mimeType: string,
    availableLabels: LabelEntity[],
    additionalPrompt?: string,
  ): Promise<GeminiLabelSuggestion> {
    if (!this.model) {
      throw new ServiceUnavailableException(
        'Gemini is not configured. Please set the GEMINI_API_KEY environment variable.',
      );
    }

    if (availableLabels.length === 0) {
      return {
        labelId: null,
        labelName: null,
        confidence: 0,
        reasoning: 'No labels are available for this project.',
      };
    }

    const labelsInfo = availableLabels.map((l) => ({
      id: l.id,
      name: l.name,
      description: l.description ?? null,
    }));

    const labelsTxtContent = [
      'Available labels for this project:',
      '',
      ...labelsInfo.map(
        (l, i) =>
          `${i + 1}. id="${l.id}" | name="${l.name}"${l.description ? ` | description="${l.description}"` : ''}`,
      ),
    ].join('\n');

    const prompt = `You are a data-labeling assistant. Analyze the provided file and the attached labels.txt file, then decide which single label best fits the file.

Respond ONLY with a valid JSON object (no markdown fences, no extra text) in this exact structure:
{
  "labelId": "<id of the chosen label>",
  "labelName": "<name of the chosen label>",
  "confidence": <number between 0 and 1>,
  "reasoning": "<brief explanation>"
}

If none of the labels fits, set labelId and labelName to null and explain in reasoning.${additionalPrompt ? `\n\nAdditional instructions: ${additionalPrompt}` : ''}`;

    const labelsPart: Part = {
      inlineData: {
        data: Buffer.from(labelsTxtContent, 'utf-8').toString('base64'),
        mimeType: 'text/plain',
      },
    };

    const filePart: Part = {
      inlineData: {
        data: fileBuffer.toString('base64'),
        mimeType,
      },
    };

    try {
      const result = await this.model!.generateContent([
        prompt,
        labelsPart,
        filePart,
      ]);
      const text = result.response.text().trim();

      // Strip optional markdown code fences that the model may add
      const jsonText = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
      const raw = JSON.parse(jsonText);

      return this.validateAndNormalize(raw, availableLabels);
    } catch (err) {
      this.logger.error('Gemini label suggestion failed', err);
      throw new InternalServerErrorException(
        'Failed to get label suggestion from Gemini.',
      );
    }
  }

  private validateAndNormalize(
    raw: any,
    availableLabels: LabelEntity[],
  ): GeminiLabelSuggestion {
    // Validate reasoning
    if (typeof raw?.reasoning !== 'string') {
      throw new InternalServerErrorException(
        'Gemini returned an invalid response: "reasoning" must be a string.',
      );
    }

    // Validate confidence
    const confidence = Number(raw?.confidence);
    if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
      throw new InternalServerErrorException(
        'Gemini returned an invalid response: "confidence" must be a finite number between 0 and 1.',
      );
    }

    // Validate labelId
    const labelId: string | null = raw?.labelId ?? null;
    if (labelId !== null && typeof labelId !== 'string') {
      throw new InternalServerErrorException(
        'Gemini returned an invalid response: "labelId" must be a string or null.',
      );
    }

    if (labelId !== null) {
      const matched = availableLabels.find((l) => l.id === labelId);
      if (!matched) {
        throw new InternalServerErrorException(
          `Gemini returned an unrecognised labelId "${labelId}" that is not in the available labels.`,
        );
      }
      // Derive labelName from the known label entity — do not trust the model
      return {
        labelId: matched.id,
        labelName: matched.name,
        confidence,
        reasoning: raw.reasoning,
      };
    }

    return { labelId: null, labelName: null, confidence, reasoning: raw.reasoning };
  }
}
