import Redis from "ioredis";

declare global {
  // eslint-disable-next-line no-var
  var _adminRedis: Redis | null | undefined;
}

function getRedis(): Redis | null {
  if (!process.env.REDIS_URL) return null;
  if (!global._adminRedis) {
    global._adminRedis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      enableOfflineQueue: false,
      connectTimeout: 2000,
    });
    global._adminRedis.on("error", (err: Error) => {
      console.error("[Redis] Error:", err.message);
    });
  }
  return global._adminRedis;
}

export async function cacheDelete(key: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.del(key);
  } catch {}
}

export async function cacheDeletePattern(pattern: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    let cursor = "0";
    do {
      const [nextCursor, keys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
      cursor = nextCursor;
      if (keys.length > 0) await redis.del(...keys);
    } while (cursor !== "0");
  } catch {}
}
