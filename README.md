# YouTube Playlist to Infographic Generator

تطبيق ويب لتحويل فيديوهات YouTube من قوائم التشغيل إلى صور Infographic باستخدام الذكاء الاصطناعي.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- API keys (Apify, Gemini, Atlas Cloud)

### Installation

```bash
# Clone & Install
git clone <repo-url>
cd youtube-infographic-generator

# Backend
cd backend
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run dev

# Frontend (new terminal)
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## 📁 Project Structure

```
├── backend/          # Express.js API (Render)
├── frontend/         # Next.js App (Vercel)
└── docs/            # Documentation
```

## 🔗 Tech Stack

- **Frontend**: Next.js, TypeScript, TailwindCSS
- **Backend**: Express.js, TypeScript, Prisma
- **Database**: PostgreSQL (Supabase)
- **AI**: Google Gemini, Atlas Cloud
- **APIs**: Apify (YouTube scraping)
- **Hosting**: Vercel (frontend), Render (backend)

## 📖 Documentation

See [docs/](./docs/) for detailed documentation.
