# ⚡ CallCoach AI - Quick Start

## 1️⃣ Install Dependencies

```bash
npm install
```

## 2️⃣ Setup Supabase Credentials

Create a file called **`.env.local`** in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Where to find these values:

1. Go to [supabase.com](https://supabase.com) and open your project
2. Click **Settings** (gear icon) → **API**
3. Copy:
   - **Project URL** → put in `VITE_SUPABASE_URL`
   - **anon public** key → put in `VITE_SUPABASE_ANON_KEY`

## 3️⃣ Run the App

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 📍 Routes

- **Landing Page**: `/` or `http://localhost:5173/`
- **Dashboard**: `/dashboard` or `http://localhost:5173/dashboard`

---

## 📊 Database Notes

Your Supabase already has these tables:
- ✅ `comerciais`
- ✅ `clientes`
- ✅ `treinos`

The app expects:
- At least **1 comercial** with `id = 1`
- Data will load automatically from your existing tables

### Optional: Add Demo Data

If you want sample data, run `demo-data.sql` in your Supabase SQL Editor (optional).

---

## 🎯 What You'll See

**Landing Page:**
- Futuristic dark design
- "Train Smarter. Close Faster."
- Button to access Dashboard

**Dashboard:**
- Overview tab with stats cards
- Training sessions table
- Training Simulator placeholder

---

## 🐛 Troubleshooting

**"Failed to resolve import react-router-dom"**
→ Run `npm install`

**"Invalid Supabase URL"**
→ Check your `.env.local` file exists and has correct values

**Dashboard shows "No data"**
→ Make sure you have at least 1 comercial with `id = 1` in your database

**Port 5173 already in use**
→ Kill the process or Vite will auto-select another port

