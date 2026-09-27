/**
 * Server-side in-memory rate limiting & cost control untuk endpoint AI.
 * Sesuai Prioritas 10:
 * - Rate limit per IP / Session
 * - Batasi request frequency (cooldown)
 * - Batasi body size & panjang input
 */

interface RateLimitRecord {
  timestamps: number[];
  lastRequestTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Bersihkan data lama setiap 5 menit agar tidak terjadi memory leak
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now - record.lastRequestTime > 10 * 60 * 1000) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  maxRequestsPerMinute?: number;
  cooldownMs?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  code?: "RATE_LIMIT_EXCEEDED" | "COOLDOWN_ACTIVE";
  message?: string;
  retryAfterSeconds?: number;
}

export function getClientIdentifier(req: Request, fallbackSessionId?: string): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown-ip";
  const userAgent = req.headers.get("user-agent")?.slice(0, 50) || "unknown-ua";
  const session = fallbackSessionId || req.headers.get("x-session-id") || "";

  return `${ip}::${session}::${userAgent}`;
}

export function checkRateLimit(
  clientId: string,
  options: RateLimitOptions = {}
): RateLimitResult {
  const { maxRequestsPerMinute = 15, cooldownMs = 1500 } = options;
  const now = Date.now();

  const record = rateLimitStore.get(clientId) || {
    timestamps: [],
    lastRequestTime: 0,
  };

  // Cooldown check (mencegah double click / spam rapid-fire)
  if (record.lastRequestTime > 0 && now - record.lastRequestTime < cooldownMs) {
    const remainingMs = cooldownMs - (now - record.lastRequestTime);
    return {
      allowed: false,
      code: "COOLDOWN_ACTIVE",
      message: "Permintaan terlalu cepat. Mohon tunggu sejenak sebelum mencoba lagi.",
      retryAfterSeconds: Math.ceil(remainingMs / 1000),
    };
  }

  // Sliding window check untuk 60 detik terakhir
  const oneMinuteAgo = now - 60 * 1000;
  record.timestamps = record.timestamps.filter((ts) => ts > oneMinuteAgo);

  if (record.timestamps.length >= maxRequestsPerMinute) {
    const oldestTimestamp = record.timestamps[0];
    const retryAfterSeconds = Math.ceil((oldestTimestamp + 60 * 1000 - now) / 1000);
    return {
      allowed: false,
      code: "RATE_LIMIT_EXCEEDED",
      message: "Batas frekuensi permintaan AI tercapai. Silakan coba kembali dalam beberapa detik.",
      retryAfterSeconds: Math.max(1, retryAfterSeconds),
    };
  }

  // Catat request baru
  record.timestamps.push(now);
  record.lastRequestTime = now;
  rateLimitStore.set(clientId, record);

  return { allowed: true };
}

/**
 * Validasi ukuran raw body agar tidak melampaui batasan aman (maksimal 50KB)
 */
export function validateBodySize(rawString: string, maxBytes = 50 * 1024): boolean {
  return Buffer.byteLength(rawString, "utf8") <= maxBytes;
}
