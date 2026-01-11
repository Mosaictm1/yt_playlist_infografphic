import dotenv from 'dotenv';
dotenv.config();

export const env = {
    // Server
    PORT: parseInt(process.env.PORT || '3000', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',

    // Database
    DATABASE_URL: process.env.DATABASE_URL || '',

    // Supabase
    SUPABASE_URL: process.env.SUPABASE_URL || '',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || '',

    // External APIs
    APIFY_API_TOKEN: process.env.APIFY_API_TOKEN || '',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    ATLAS_CLOUD_API_KEY: process.env.ATLAS_CLOUD_API_KEY || '',

    // Telegram (optional)
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID || '',
} as const;

export const validateEnv = () => {
    const required = [
        'DATABASE_URL',
        'APIFY_API_TOKEN',
        'GEMINI_API_KEY',
        'ATLAS_CLOUD_API_KEY',
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        console.warn(`⚠️ Missing environment variables: ${missing.join(', ')}`);
    }
};
