# Book & Notes Swap

A peer-to-peer marketplace for students to buy, sell, or give away textbooks, lab manuals, and subject notes between semesters.

## Features

- **Browse & Search** — home feed of all listings with search by title/subject, filters for subject, semester, condition, and Free/Paid
- **Post a Listing** — form to add a book/notes item with photo upload, condition, price or mark as Free, and your contact info
- **Listing Detail + Contact Seller** — full item details with one-tap WhatsApp, call, and email buttons
- **Live updates** — new listings appear in real time via Supabase Realtime

## Tech Stack

- **Frontend:** React 18 + Vite
- **Backend/Database:** Supabase (Postgres + Realtime + Storage for photos)
- **Hosting:** Vercel (or any static host)

## Getting Started

### 1. Install

```bash
npm install
npm run dev
```

The app runs at http://localhost:5173. Without Supabase keys it shows a friendly "not connected" state, so you can still check out the UI.

### 2. Set up Supabase

1. Create a free project at https://supabase.com/dashboard
2. Open **SQL Editor** and run `supabase/schema.sql` (creates the `listings` table, the `listing-images` storage bucket, RLS policies, and enables realtime)
3. (Optional but recommended) Run `supabase/seed.sql` to add sample listings
4. Create a **Storage** bucket (or let `schema.sql` do it), then in Bucket settings make sure `listing-images` is **Public**
5. Go to **Project Settings → API**, copy your **Project URL** and **anon public key** into a new `.env` file:

```
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

6. Restart the dev server

> Security note: this hackathon setup keeps RLS open (anyone can read/post). When you add authentication, lock the `insert/update/delete` policies down to `auth.uid()`.

## Project Structure

```
src/
  main.jsx               # app entry + router
  App.jsx                # layout + routes
  index.css              # all styling (plain CSS, no framework)
  lib/
    supabase.js          # Supabase client (reads .env, handles missing keys)
    format.js            # price/date/currency helpers
  data/
    constants.js         # subjects, semesters, conditions
  components/
    ListingCard.jsx      # feed card
    EmptyState.jsx       # empty/error states
  pages/
    HomePage.jsx         # browse + search + filters (+ realtime)
    NewListingPage.jsx   # post a listing form (+ photo upload)
    ListingDetailPage.jsx# detail + contact seller
supabase/
  schema.sql             # tables, bucket, RLS, realtime
  seed.sql               # sample data
```

## Deploying to Vercel

```bash
npm i -g vercel
vercel
```

Set the two `VITE_*` environment variables in your Vercel project settings (Settings → Environment Variables), then redeploy.

## Future Scope

- In-app chat, seller ratings, wishlist push notifications, semester-wide book bundles