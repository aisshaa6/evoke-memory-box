# Evoke — Memory Box

A personal memory journal: memories with photos, audio, location and tags, a daily journal, calendar, map and statistics.

## Stack
React 19 + Vite 7, react-router 7, Leaflet, Recharts, lucide-react. Backend: Supabase (Auth, Postgres with RLS, Storage).

## Setup
1. Create a Supabase project and run `supabase/schema.sql` in the SQL Editor.
2. Copy `.env.example` to `.env` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (the publishable key).
3. `npm install && npm run dev`

On Vercel, set the same two variables for Production and Preview.
