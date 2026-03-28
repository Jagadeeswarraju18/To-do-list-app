import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis/cloudflare";

type LimiterName = "auth" | "search";

export type EdgeRateLimitResult = Awaited<ReturnType<Ratelimit["limit"]>> & {
    bypassed?: boolean;
};

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const hasConfig = Boolean(redisUrl && redisToken);

const redis = hasConfig
    ? new Redis({
        url: redisUrl!,
        token: redisToken!,
    })
    : null;

const limiters = redis
    ? {
        auth: new Ratelimit({
            redis,
            limiter: Ratelimit.fixedWindow(8, "5 m"),
            prefix: "ratelimit:auth",
            analytics: true,
        }),
        search: new Ratelimit({
            redis,
            limiter: Ratelimit.fixedWindow(60, "1 m"),
            prefix: "ratelimit:search",
            analytics: true,
        }),
    }
    : null;

export async function runEdgeRateLimit(
    limiter: LimiterName,
    identifier: string
): Promise<EdgeRateLimitResult> {
    if (!limiters) {
        return {
            success: true,
            limit: 0,
            remaining: 0,
            reset: Date.now(),
            pending: Promise.resolve(),
            bypassed: true,
        };
    }

    const result = await limiters[limiter].limit(identifier);
    if (result.pending) {
        void result.pending.catch(() => undefined);
    }
    return result;
}

export function buildEdgeRateLimitHeaders(result: EdgeRateLimitResult): Record<string, string> {
    if (result.bypassed || !result.limit) {
        return {};
    }

    const retryAfterSeconds = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
    return {
        "Retry-After": String(retryAfterSeconds),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": String(Math.max(0, result.remaining)),
        "X-RateLimit-Reset": String(Math.floor(result.reset / 1000)),
    };
}
