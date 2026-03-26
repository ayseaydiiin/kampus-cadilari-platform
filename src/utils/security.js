const rateLimitStore = globalThis.__KAMPUS_RATE_LIMITS__ || new Map();
globalThis.__KAMPUS_RATE_LIMITS__ = rateLimitStore;

function cleanupExpiredEntries(now) {
  for (const [key, entry] of rateLimitStore.entries()) {
    if (!entry || entry.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

export function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) {
    return cfIp.trim();
  }

  return 'unknown';
}

export function checkRateLimit(request, key, { limit, windowMs }) {
  const now = Date.now();
  cleanupExpiredEntries(now);

  const ip = getClientIp(request);
  const bucketKey = `${key}:${ip}`;
  const current = rateLimitStore.get(bucketKey);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  rateLimitStore.set(bucketKey, current);
  return { allowed: true };
}

export function rateLimitResponse(message = 'Cok fazla istek gonderildi', retryAfter = 60) {
  return new Response(
    JSON.stringify({ success: false, error: message }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
      },
    }
  );
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}
