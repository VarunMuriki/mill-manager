# 🌾 Sri Kanakadhara Rice Mill Manager

Profit calculator and batch management app for **Sri Kanakadhara Agro Industries**.

## Features
- Add batches with paddy, cost, and milling output details
- Instant profit/loss calculation
- Rice yield %, margin %, profit per kg
- Batch history with search
- Monthly reports and charts
- Mobile-first PWA (installs on phone like an app)

## Tech Stack
- **Frontend**: Next.js 14 + Tailwind CSS
- **Database**: Supabase (PostgreSQL, free tier)
- **Hosting**: Vercel (free tier)

## Setup

### 1. Supabase Database
1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the file: `supabase/migrations/001_initial_schema.sql`
3. Copy your **Project URL** and **Anon Key** from Settings → API

### 2. Environment Variables
Create a `.env.local` file:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Locally
```bash
npm install
npm run dev
```

### 4. Deploy to Vercel
1. Push to GitHub
2. Import repo on [vercel.com](https://vercel.com)
3. Add environment variables
4. Deploy!

## Database Schema
See `supabase/migrations/001_initial_schema.sql`
