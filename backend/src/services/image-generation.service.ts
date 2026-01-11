import axios from 'axios';

interface ImageGenerationResponse {
    data: {
        outputs: string[];
    };
}

export class ImageGenerationService {
    private readonly baseUrl = 'https://api.atlascloud.ai/api/v1/model/generateImage';

    /**
     * Generate an infographic image from a design prompt
     */
    async generateImage(prompt: string, atlasCloudApiKey: string): Promise<string> {
        try {
            const response = await axios.post<ImageGenerationResponse>(
                this.baseUrl,
                {
                    model: 'google/nano-banana-pro/edit',
                    prompt: prompt,
                    output_format: 'png',
                    resolution: '1k',
                    enable_base64_output: false,
                    enable_sync_mode: true,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${atlasCloudApiKey}`,
                        'Content-Type': 'application/json',
                    },
                    timeout: 180000, // 3 minutes timeout for image generation
                }
            );

            const imageUrl = response.data.data.outputs[0];

            if (!imageUrl) {
                throw new Error('No image URL returned from API');
            }

            return imageUrl;
        } catch (error) {
            console.error('Error generating image:', error);
            throw error;
        }
    }

    /**
     * Download image from URL and return as buffer
     */
    async downloadImage(imageUrl: string): Promise<Buffer> {
        try {
            const response = await axios.get(imageUrl, {
                responseType: 'arraybuffer',
                timeout: 60000,
            });

            return Buffer.from(response.data);
        } catch (error) {
            console.error('Error downloading image:', error);
            throw error;
        }
    }
}

export const imageGenerationService = new ImageGenerationService();
