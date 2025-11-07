# 🚀 CallCoach AI - Setup Guide

## 1️⃣ Install Dependencies

```bash
npm install
```

## 2️⃣ Configure Supabase

### Get Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Create a new project (or use existing)
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (long string starting with `eyJ...`)

### Setup Environment Variables

Create `.env.local` file in the root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 3️⃣ Setup Database

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy entire contents of `supabase-setup.sql`
3. Paste and **Run** it
4. Verify tables were created in **Table Editor**

This will create:
- ✅ `comerciais` table with 1 demo user (Diogo Costa, ID=1)
- ✅ `clientes` table with 3 demo clients
- ✅ `treinos` table with 4 demo training sessions

## 4️⃣ Run the App

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## 📍 Navigation

- **Landing Page**: `http://localhost:5173/`
- **Dashboard**: `http://localhost:5173/dashboard`

## 🔧 Troubleshooting

**Error: "Failed to resolve import react-router-dom"**
→ Run `npm install` to install all dependencies

**Error: "Invalid Supabase URL"**
→ Check your `.env.local` has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

**No data showing in dashboard**
→ Make sure you ran `supabase-setup.sql` in Supabase SQL Editor

## 📊 Demo Data

The setup includes:
- 1 comercial: **Diogo Costa** (ID: 1)
- 3 clients: Marta, João, Ana
- 4 training sessions with scores and feedback

You can view all this in the Dashboard!

