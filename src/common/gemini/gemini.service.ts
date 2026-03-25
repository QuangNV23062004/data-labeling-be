import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
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
  private model: GenerativeModel;

  constructor(private readonly typedConfigService: TypedConfigService) {
    const { apiKey, model } = this.typedConfigService.gemini;
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model });
  }

  async suggestLabel(
    fileBuffer: Buffer,
    mimeType: string,
    availableLabels: LabelEntity[],
    additionalPrompt?: string,
  ): Promise<GeminiLabelSuggestion> {
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
      const result = await this.model.generateContent([
        prompt,
        labelsPart,
        filePart,
      ]);
      const text = result.response.text().trim();

      // Strip optional markdown code fences that the model may add
      const jsonText = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
      const parsed: GeminiLabelSuggestion = JSON.parse(jsonText);
      return parsed;
    } catch (err) {
      this.logger.error('Gemini label suggestion failed', err);
      throw new InternalServerErrorException(
        'Failed to get label suggestion from Gemini.',
      );
    }
  }
}
