# Oman Gold API

A Next.js 16 App Router application that serves XAU/OMR gold prices per gram for 24k, 22k, 21k, and 18k gold. GoldAPI.io supplies live prices, Supabase stores price history, and public REST endpoints read stored data without spending the external API quota.

The app also includes calculators for gold value and gold zakat. The zakat calculator uses the latest stored 24k OMR price from Supabase by default, lets users override the payment-day price, aggregates multiple holdings, converts karats to pure 24k equivalent weight, and shows both treatments for personally worn daily-use jewelry when selected.

**Live app:** [https://oman-gold-api.vercel.app](https://oman-gold-api.vercel.app)

## Setup

```bash
git clone https://github.com/your-username/oman-gold-api.git
cd oman-gold-api
npm install
```

Copy `.env.example` to `.env.local` and replace every placeholder:

| Variable | Required | Description |
|---|---:|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-only Supabase service role key |
| `GOLD_API_KEY` | Yes | GoldAPI.io API key |
| `API_SECRET` | Yes | Bearer token for manual quota-spending endpoints |
| `CRON_SECRET` | Yes | Separate bearer token used by Vercel Cron |

Generate long, random, different values for `API_SECRET` and `CRON_SECRET`. Never expose either value in client-side code or prefix it with `NEXT_PUBLIC_`.

Create the database table in Supabase:

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

CREATE INDEX idx_gold_prices_created_at
  ON public.gold_prices (created_at DESC);
```

Run locally:

```bash
npm run dev
```

To seed an empty database, run the authorized update endpoint or let the scheduled cron run. Public read endpoints never call GoldAPI.io and return `404` when no stored price exists.

## API Reference

The supported namespace is `/api/v1`. All responses are JSON, prices are OMR per gram, and public reads require no authorization.

| Endpoint | Auth | GoldAPI usage | Purpose |
|---|---:|---:|---|
| `GET /api/v1` | Public | None | Latest stored prices |
| `GET /api/v1/gold/latest` | Public | None | Latest stored price row |
| `GET /api/v1/gold/latest?live=true` | `API_SECRET` | 1 call | Fetch live prices and conditionally store them |
| `GET /api/v1/gold/calc?grams=&karat=` | Public | None | Calculate a total from the latest stored price |
| `GET /api/v1/gold/zakat?grams=&karat=` | Public | None | Estimate gold zakat from the latest stored 24k price |
| `GET /api/v1/gold/history?limit=50&offset=0` | Public | None | Paginated stored history, newest first |
| `GET /api/v1/gold/update` | `API_SECRET` | 1 call | Manual refresh and conditional insert |
| `GET /api/v1/cron/update-gold` | `CRON_SECRET` | 1 call | Scheduled refresh |

### Authorization and rate limiting

Manual live and update requests must send the exact `API_SECRET` bearer token:

```bash
curl -H "Authorization: Bearer YOUR_API_SECRET" \
  "https://oman-gold-api.vercel.app/api/v1/gold/latest?live=true"

curl -H "Authorization: Bearer YOUR_API_SECRET" \
  "https://oman-gold-api.vercel.app/api/v1/gold/update"
```

Missing or incorrect authorization returns `401`:

```json
{ "error": "Unauthorized" }
```

Authorized manual live/update traffic is limited collectively to 5 requests per IP per 10 minutes. Exceeding the limit returns `429`, a JSON error, and a `Retry-After` header. The limiter is in memory, so on serverless deployments it applies per warm application instance; use a shared store such as Upstash Redis if a globally coordinated limit is required.

### Latest stored prices

```bash
curl "https://oman-gold-api.vercel.app/api/v1"
curl "https://oman-gold-api.vercel.app/api/v1/gold/latest"
```

Existing successful response shapes are unchanged. Example:

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

### Calculator

```bash
curl "https://oman-gold-api.vercel.app/api/v1/gold/calc?grams=5&karat=22k"
```

`grams` must be a positive number. `karat` accepts `24`, `22`, `21`, or `18`, optionally followed by `k`. Invalid input returns a JSON `400` response.

### Gold zakat

```bash
curl "https://oman-gold-api.vercel.app/api/v1/gold/zakat?grams=100&karat=21k"
curl "https://oman-gold-api.vercel.app/api/v1/gold/zakat?items=100:21k,25:22k"
curl "https://oman-gold-api.vercel.app/api/v1/gold/zakat?items=100:21k:personal,50:24k"
```

Gold zakat uses the latest stored 24k price only; it never calls GoldAPI.io. The endpoint converts each holding to pure 24k equivalent weight with `weight x karat / 24`, aggregates the pure weight, checks the 85g nisab, and applies the 2.5% zakat rate when nisab is met.

`grams` must be a positive number. `karat` accepts `24`, `22`, `21`, or `18`, optionally followed by `k`. Multiple holdings can be sent with comma-separated `items=grams:karat` values, repeated `items[]`, repeated `holding`, or repeated matching `grams` and `karat` params. Add `:personal` to an item, or `personal_use=true` with a single holding, to mark personally worn daily-use jewelry. When any holding is marked personal use, the response includes both `including_personal_use` and `exempting_personal_use` scenarios because this is a point of scholarly difference.

Example response:

```json
{
  "grams": 100,
  "karat": "21k",
  "pure_weight_grams": 87.5,
  "nisab_grams": 85,
  "nisab_met": true,
  "price_per_gram_24k": 61.854,
  "currency": "OMR",
  "zakat_rate": 0.025,
  "zakat_grams": 2.188,
  "zakat_amount": 135.306,
  "updated_at": "2026-03-16T12:00:00.000Z"
}
```

### History

```bash
curl "https://oman-gold-api.vercel.app/api/v1/gold/history"
curl "https://oman-gold-api.vercel.app/api/v1/gold/history?limit=100"
curl "https://oman-gold-api.vercel.app/api/v1/gold/history?limit=500&offset=500"
```

`limit` is optional, defaults to 50, and must be an integer from 1 through 500. `offset` defaults to 0 and must be a non-negative integer. The homepage follows these pages to load the complete history, then lets users select 7 days, 30 days, 90 days, 1 year, or all records. Invalid limits return:

```json
{
  "success": false,
  "error": "limit must be an integer between 1 and 500"
}
```

### Cron

Vercel runs `/api/v1/cron/update-gold` once daily at 12:00 UTC, as configured in `vercel.json`. Vercel sends `CRON_SECRET` as a bearer token. Direct calls require the same header:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  "https://oman-gold-api.vercel.app/api/v1/cron/update-gold"
```

## Legacy Routes

The unversioned endpoints remain functional as thin aliases and preserve their existing response shapes. They are deprecated; new consumers should use v1.

| Deprecated alias | Preferred endpoint |
|---|---|
| `/api` | `/api/v1` |
| `/api/gold/latest` | `/api/v1/gold/latest` |
| `/api/gold/calc` | `/api/v1/gold/calc` |
| `/api/gold/zakat` | `/api/v1/gold/zakat` |
| `/api/gold/history` | `/api/v1/gold/history` |
| `/api/gold/update` | `/api/v1/gold/update` |
| `/api/cron/update-gold` | `/api/v1/cron/update-gold` |

Authorization, rate limiting, validation, and query parameters behave identically through legacy aliases.

## Scripts

```bash
npm run dev
npm run build
npm start
```
