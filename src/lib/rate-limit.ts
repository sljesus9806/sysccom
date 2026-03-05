/**
 * In-memory rate limiter for API endpoints.
 * For production with multiple instances, replace with Redis-based rate limiting.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.resetAt < now) {
      store.delete(key)
    }
  }
}, 5 * 60 * 1000)

interface RateLimitOptions {
  maxAttempts: number
  windowMs: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

export function checkRateLimit(
  key: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + options.windowMs })
    return { allowed: true, remaining: options.maxAttempts - 1, resetAt: now + options.windowMs }
  }

  entry.count++
  store.set(key, entry)

  if (entry.count > options.maxAttempts) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  return { allowed: true, remaining: options.maxAttempts - entry.count, resetAt: entry.resetAt }
}

export function rateLimitResponse(resetAt: number) {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000)
  return Response.json(
    { error: 'Demasiados intentos. Intenta de nuevo en unos minutos.' },
    {
      status: 429,
      headers: { 'Retry-After': String(retryAfter) },
    }
  )
}

/**
 * Extract client IP from request headers.
 * Works behind proxies (Vercel, Cloudflare, nginx).
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}
