import { GoogleGenerativeAI } from '@google/generative-ai';

export class AIAnalysisService {
    private readonly model: string = 'gemini-2.5-flash';

    /**
     * Analyze transcript and extract key points
     */
    async analyzeContent(transcript: string, geminiApiKey: string): Promise<string> {
        try {
            const genAI = new GoogleGenerativeAI(geminiApiKey);
            const model = genAI.getGenerativeModel({ model: this.model });

            const prompt = `قم بإعطائي تقرير مفصل لنقاط الإفادة التي تم ذكرها في هذا النص:

${transcript}

أريد:
1. النقاط الرئيسية (3-5 نقاط)
2. الإحصائيات أو الأرقام المذكورة (إن وجدت)
3. الاقتباسات المهمة (إن وجدت)
4. الخلاصة في سطر واحد

اجعل التقرير موجزًا ومفيدًا للاستخدام في تصميم Infographic.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;

            return response.text();
        } catch (error) {
            console.error('Error analyzing content:', error);
            throw error;
        }
    }

    /**
     * Generate infographic design prompt
     */
    async generateDesignPrompt(analysisReport: string, geminiApiKey: string): Promise<string> {
        try {
            const genAI = new GoogleGenerativeAI(geminiApiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

            const prompt = `Based on this analysis report, generate a detailed infographic design prompt in English that can be used with an AI image generator.

Analysis Report:
${analysisReport}

Generate a visual design prompt that includes:
1. Layout structure (vertical infographic)
2. Color scheme (suggest specific colors)
3. Visual elements (icons, shapes)
4. Text placement
5. Overall style (modern, professional, etc.)

The prompt should be detailed enough to generate a beautiful, informative infographic.
Start directly with the design description, no introduction needed.
Keep it under 500 words.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;

            return response.text();
        } catch (error) {
            console.error('Error generating design prompt:', error);
            throw error;
        }
    }
}

export const aiAnalysisService = new AIAnalysisService();

