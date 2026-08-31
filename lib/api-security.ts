import { NextResponse } from 'next/server'

const RATE_LIMIT_MAX_REQUESTS = 5
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000

interface RateLimitEntry {
  count: number
  resetAt: number
}

const globalForRateLimit = globalThis as typeof globalThis & {
  goldApiRateLimits?: Map<string, RateLimitEntry>
}

const rateLimits =
  globalForRateLimit.goldApiRateLimits ??
  (globalForRateLimit.goldApiRateLimits = new Map<string, RateLimitEntry>())

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  return forwardedFor?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
}

function isRateLimited(request: Request): { limited: boolean; retryAfter: number } {
  const now = Date.now()
  const clientIp = getClientIp(request)
  const current = rateLimits.get(clientIp)

  if (!current || current.resetAt <= now) {
    rateLimits.set(clientIp, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return { limited: false, retryAfter: 0 }
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      limited: true,
      retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    }
  }

  current.count += 1
  return { limited: false, retryAfter: 0 }
}

/** Protects routes that spend the GoldAPI.io quota. Fails closed if API_SECRET is unset. */
export function authorizeGoldApiRequest(request: Request): NextResponse | null {
  const apiSecret = process.env.API_SECRET
  const authHeader = request.headers.get('authorization')

  if (!apiSecret || authHeader !== `Bearer ${apiSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { limited, retryAfter } = isRateLimited(request)
  if (limited) {
    return NextResponse.json(
      { error: 'Too many requests. Try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfter) },
      }
    )
  }

  return null
}
