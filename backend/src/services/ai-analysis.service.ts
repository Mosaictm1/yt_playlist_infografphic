import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { env } from '../config/env.js';

// Interface for infographic customization options
export interface InfographicOptions {
    language: 'ar' | 'en';
    orientation: 'landscape' | 'portrait' | 'square';
    detailLevel: 'concise' | 'standard' | 'detailed';
    customDescription?: string;
}

export class AIAnalysisService {
    private readonly geminiModel: string = 'gemini-2.5-flash';
    private readonly openaiModel: string = 'gpt-4o-mini';

    /**
     * Call Gemini API with fallback to OpenAI
     */
    private async generateWithFallback(prompt: string, geminiApiKey: string): Promise<string> {
        // Try Gemini first
        try {
            const genAI = new GoogleGenerativeAI(geminiApiKey);
            const model = genAI.getGenerativeModel({ model: this.geminiModel });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            console.log('[AI] Using Gemini successfully');
            return response.text();
        } catch (geminiError: any) {
            console.warn('[AI] Gemini failed:', geminiError.message);

            // Fallback to OpenAI
            const openaiKey = env.OPENAI_API_KEY;
            if (!openaiKey) {
                console.error('[AI] No OpenAI API key available for fallback');
                throw geminiError;
            }

            try {
                console.log('[AI] Falling back to OpenAI...');
                const openai = new OpenAI({ apiKey: openaiKey });
                const completion = await openai.chat.completions.create({
                    model: this.openaiModel,
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 2000,
                });

                const text = completion.choices[0]?.message?.content || '';
                console.log('[AI] OpenAI fallback successful');
                return text;
            } catch (openaiError: any) {
                console.error('[AI] OpenAI fallback also failed:', openaiError.message);
                throw openaiError;
            }
        }
    }

    /**
     * Analyze transcript and extract key points
     */
    async analyzeContent(transcript: string, geminiApiKey: string, options?: InfographicOptions): Promise<string> {
        const language = options?.language || 'ar';
        const detailLevel = options?.detailLevel || 'standard';

        // Adjust number of points based on detail level
        let pointsCount = '3-5';
        if (detailLevel === 'concise') {
            pointsCount = '2-3';
        } else if (detailLevel === 'detailed') {
            pointsCount = '5-7';
        }

        const prompt = language === 'ar'
            ? `قم بإعطائي تقرير مفصل لنقاط الإفادة التي تم ذكرها في هذا النص:

${transcript}

أريد:
1. النقاط الرئيسية (${pointsCount} نقاط)
2. الإحصائيات أو الأرقام المذكورة (إن وجدت)
3. الاقتباسات المهمة (إن وجدت)
4. الخلاصة في سطر واحد

اجعل التقرير موجزًا ومفيدًا للاستخدام في تصميم Infographic.`
            : `Provide a detailed report of the key points mentioned in this text:

${transcript}

I want:
1. Main points (${pointsCount} points)
2. Statistics or numbers mentioned (if any)
3. Important quotes (if any)
4. Summary in one line

Make the report concise and useful for designing an Infographic.`;

        return this.generateWithFallback(prompt, geminiApiKey);
    }

    /**
     * Generate infographic design prompt
     */
    async generateDesignPrompt(analysisReport: string, geminiApiKey: string, options?: InfographicOptions): Promise<string> {
        const orientation = options?.orientation || 'landscape';
        const language = options?.language || 'ar';
        const customDescription = options?.customDescription || '';

        // Map orientation to aspect ratio
        const orientationMap = {
            landscape: 'horizontal (16:9 aspect ratio)',
            portrait: 'vertical (9:16 aspect ratio)',
            square: 'square (1:1 aspect ratio)',
        };

        const orientationDesc = orientationMap[orientation];
        const languageNote = language === 'ar'
            ? 'The text in the infographic should be in Arabic (right-to-left).'
            : 'The text in the infographic should be in English.';

        const customNote = customDescription
            ? `\n\nUser's custom instructions: ${customDescription}`
            : '';

        const prompt = `Based on this analysis report, generate a detailed infographic design prompt in English that can be used with an AI image generator.

Analysis Report:
${analysisReport}

Generate a visual design prompt that includes:
1. Layout structure (${orientationDesc} infographic)
2. Color scheme (suggest specific colors)
3. Visual elements (icons, shapes)
4. Text placement
5. Overall style (modern, professional, etc.)

${languageNote}${customNote}

The prompt should be detailed enough to generate a beautiful, informative infographic.
Start directly with the design description, no introduction needed.
Keep it under 500 words.`;

        return this.generateWithFallback(prompt, geminiApiKey);
    }
}

export const aiAnalysisService = new AIAnalysisService();
