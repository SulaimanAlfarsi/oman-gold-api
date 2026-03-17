# Oman Gold API

A Next.js app that exposes gold prices in **Omani Rial (OMR)** per gram for 24k, 22k, 21k, and 18k gold. Prices are fetched from [GoldAPI.io](https://www.goldapi.io/) (XAU/OMR), stored in **Supabase**, and served via REST APIs. The site includes a hero chart, price cards, and a calculator.

**Live app:** [https://oman-gold-api.vercel.app/](https://oman-gold-api.vercel.app/)

---

## Table of contents

- [Tech stack](#tech-stack)
- [Step-by-step setup](#step-by-step-setup)
- [Running locally](#running-locally)
- [API reference (with web examples)](#api-reference-with-web-examples)
- [Cron (scheduled updates)](#cron-scheduled-updates)
- [Project structure](#project-structure)

---

## Tech stack

- **Next.js 16** (App Router)
- **Supabase** – database for gold price history
- **GoldAPI.io** – live XAU/OMR prices (per-gram 24k, 22k, 21k, 18k)
- **Vercel** – hosting and cron for scheduled updates

---

## Step-by-step setup

### 1. Clone and install

```bash
git clone https://github.com/your-username/oman-gold-api.git
cd oman-gold-api
npm install
```

### 2. Environment variables

Create `.env.local` in the project root with:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `GOLD_API_KEY` | API key from [GoldAPI.io](https://www.goldapi.io/) |
| `CRON_SECRET` | Optional; secret for protecting `/api/cron/update-gold` (e.g. random string) |

### 3. Supabase database

In the Supabase SQL editor, run:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE public.gold_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  price_24k numeric(10,3) NOT NULL,
  price_22k numeric(10,3) NOT NULL,
  price_21k numeric(10,3) NOT NULL,
  price_18k numeric(10,3) NOT NULL,
  currency text NOT NULL DEFAULT 'OMR',
  source text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_gold_prices_created_at ON public.gold_prices (created_at DESC);
```

### 4. (Optional) Seed or first update

- Call **GET** `/api` or **GET** `/api/gold/update` once. If the table is empty, the app will fetch from GoldAPI.io and insert the first row.

### 5. Deploy (e.g. Vercel)

- Connect the repo to Vercel and add the same env vars.
- Cron runs only on Vercel (see [Cron](#cron-scheduled-updates)).

---

## Running locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).  
Build for production:

```bash
npm run build
npm start
```

---

## API reference (with web examples)

Base URL for examples:

- **Local:** `http://localhost:3000`
- **Production (deployed on Vercel):** `https://oman-gold-api.vercel.app`

All responses are JSON. Prices are in **OMR per gram**.

---

### 1. Latest prices (from database)

**GET** `/api`  
Returns the latest stored gold prices. Uses the database only (no GoldAPI call) to save quota. If the table is empty, it fetches once from GoldAPI.io, inserts a row, then returns that.

**Example (browser or fetch):**

```javascript
const res = await fetch('https://oman-gold-api.vercel.app/api')
const data = await res.json()
console.log(data.prices)   // { "24k": 61.854, "22k": 56.7, "21k": 54.122, "18k": 46.391 }
console.log(data.currency) // "OMR"
console.log(data.updated_at)
```

**Example (cURL):**

```bash
curl "https://oman-gold-api.vercel.app/api"
```

**Sample response:**

```json
{
  "success": true,
  "currency": "OMR",
  "source": "goldapi.io",
  "prices": {
    "24k": 61.854,
    "22k": 56.7,
    "21k": 54.122,
    "18k": 46.391
  },
  "updated_at": "2026-03-16T12:00:00.000Z"
}
```

---

### 2. Latest stored price (with optional live fetch)

**GET** `/api/gold/latest`  
**GET** `/api/gold/latest?live=true`

- **Without `live`:** Returns the latest row from the database (no external API call).
- **With `live=true`:** Fetches current prices from GoldAPI.io, may insert a new row (duplicate/daily logic), and returns the live prices. Use sparingly to stay within API quota (e.g. 100 req/month).

**Example (from DB only):**

```javascript
const res = await fetch('https://oman-gold-api.vercel.app/api/gold/latest')
const data = await res.json()
console.log(data.prices)   // { "24k": 61.854, "22k": 56.7, "21k": 54.122, "18k": 46.391 }
console.log(data.updated_at)
```

**Example (live – uses 1 GoldAPI request):**

```javascript
const res = await fetch('https://oman-gold-api.vercel.app/api/gold/latest?live=true')
const data = await res.json()
```

**cURL:**

```bash
curl "https://oman-gold-api.vercel.app/api/gold/latest"
curl "https://oman-gold-api.vercel.app/api/gold/latest?live=true"
```

**Sample response:**

```json
{
  "currency": "OMR",
  "prices": {
    "24k": 61.854,
    "22k": 56.7,
    "21k": 54.122,
    "18k": 46.391
  },
  "updated_at": "2026-03-16T12:00:00.000Z",
  "source": "goldapi.io"
}
```

---

### 3. Calculate total price (grams × karat)

**GET** `/api/gold/calc?grams=<number>&karat=<24|22|21|18>`

Uses the latest stored price to compute **total price = grams × price_per_gram** for the given karat. No GoldAPI call.

**Parameters:**

| Name   | Required | Description                    |
|--------|----------|--------------------------------|
| `grams`| Yes      | Positive number (e.g. `10`)    |
| `karat`| Yes      | `24`, `22`, `21`, or `18` (or `24k`, `22k`, etc.) |

**Example:**

```javascript
const grams = 5
const karat = '22k'
const res = await fetch(`https://oman-gold-api.vercel.app/api/gold/calc?grams=${grams}&karat=${karat}`)
const data = await res.json()
console.log(data.total_price)      // e.g. 283.5
console.log(data.price_per_gram)   // e.g. 56.7
console.log(data.currency)         // "OMR"
```

**cURL:**

```bash
curl "https://oman-gold-api.vercel.app/api/gold/calc?grams=5&karat=22k"
```

**Sample response:**

```json
{
  "karat": "22k",
  "grams": 5,
  "price_per_gram": 56.7,
  "total_price": 283.5,
  "currency": "OMR",
  "unit": "gram",
  "updated_at": "2026-03-16T12:00:00.000Z"
}
```

**Error (400):** missing or invalid `grams` or `karat`:

```json
{ "error": "grams and karat parameters are required" }
{ "error": "Invalid karat. Use 24, 22, 21, or 18." }
```

---

### 4. Price history (for charts)

**GET** `/api/gold/history`

Returns the last **50** stored records (newest first in the array). Used by the hero chart. Database only.

**Example:**

```javascript
const res = await fetch('https://oman-gold-api.vercel.app/api/gold/history')
const data = await res.json()
console.log(data.count)  // number of rows
console.log(data.data)   // array of { id, prices: { 24k, 22k, 21k, 18k }, source, created_at }
```

**cURL:**

```bash
curl "https://oman-gold-api.vercel.app/api/gold/history"
```

**Sample response:**

```json
{
  "success": true,
  "count": 50,
  "currency": "OMR",
  "unit": "gram",
  "data": [
    {
      "id": "uuid",
      "prices": { "24k": 61.854, "22k": 56.7, "21k": 54.122, "18k": 46.391 },
      "source": "goldapi.io",
      "created_at": "2026-03-16T12:00:00.000Z"
    }
  ]
}
```

---

### 5. Manual update (insert new price row)

**GET** `/api/gold/update`

Fetches current prices from GoldAPI.io and inserts a new row if the price changed or enough time has passed (duplicate / 10‑min / daily logic). Uses **1** GoldAPI request per call. Use for manual refresh or scripting; avoid calling on every page load to preserve quota.

**Example:**

```javascript
const res = await fetch('https://oman-gold-api.vercel.app/api/gold/update')
const data = await res.json()
console.log(data.prices)
console.log(data.saved)  // inserted row
```

**cURL:**

```bash
curl "https://oman-gold-api.vercel.app/api/gold/update"
```

**Sample response:**

```json
{
  "success": true,
  "prices": { "24k": 61.854, "22k": 56.7, "21k": 54.122, "18k": 46.391 },
  "saved": { "id": "...", "price_24k": 61.854, ... }
}
```

---

### 6. Cron update (scheduled job)

**GET** `/api/cron/update-gold`

Same as manual update but intended for **Vercel Cron**. Optional: send `Authorization: Bearer <CRON_SECRET>`; if `CRON_SECRET` is set and the header is wrong, the route returns 401. Each run uses **1** GoldAPI request.

**Example (with secret):**

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" "https://oman-gold-api.vercel.app/api/cron/update-gold"
```

---

## Cron (scheduled updates)

On **Vercel**, the cron is configured in `vercel.json`:

- **Path:** `/api/cron/update-gold`
- **Schedule:** `0 12 * * *` (once per day at 12:00 UTC)

**Vercel Hobby plan** allows only **one cron run per day**, so the job is set to run once daily. That’s about **30 requests/month** to GoldAPI.io, well under a 100 req/month plan. To change the time, edit the `schedule` in `vercel.json` (e.g. `0 0 * * *` for midnight UTC). For more than one run per day, you need the [Vercel Pro plan](https://vercel.com/docs/cron-jobs).

---

## Project structure

```
oman-gold-api/
├── app/
│   ├── api/
│   │   ├── route.ts              # GET /api – latest prices from DB
│   │   ├── cron/
│   │   │   └── update-gold/      # GET /api/cron/update-gold
│   │   └── gold/
│   │       ├── calc/             # GET /api/gold/calc
│   │       ├── history/          # GET /api/gold/history
│   │       ├── latest/           # GET /api/gold/latest
│   │       └── update/           # GET /api/gold/update
│   ├── components/               # Hero chart, price cards, calculator, navbar, etc.
│   ├── page.tsx                  # Home (hero + chart)
│   ├── prices/page.tsx            # Price cards
│   ├── calculator/page.tsx       # Calculator
│   └── about/page.tsx            # About
├── lib/
│   ├── gold-api.ts               # GoldAPI.io XAU/OMR fetch
│   ├── gold-calculations.ts       # roundPrice, pricesEqual
│   ├── supabase-admin.ts         # Server Supabase client
│   └── utils.ts
├── vercel.json                    # Cron schedule
└── .env.local                     # Not committed; see env vars above
```

---

## Summary

| Endpoint | Method | Purpose | GoldAPI.io usage |
|----------|--------|---------|-------------------|
| `/api` | GET | Latest prices from DB (or seed if empty) | Only if DB empty |
| `/api/gold/latest` | GET | Latest from DB | No |
| `/api/gold/latest?live=true` | GET | Live prices, may insert | Yes (1 call) |
| `/api/gold/calc?grams=&karat=` | GET | Total price for grams × karat | No |
| `/api/gold/history` | GET | Last 50 records for charts | No |
| `/api/gold/update` | GET | Manual refresh, insert if needed | Yes (1 call) |
| `/api/cron/update-gold` | GET | Scheduled refresh (Vercel Cron) | Yes (1 call per run) |

All examples use the live base URL **https://oman-gold-api.vercel.app**. For local development, use `http://localhost:3000`.
