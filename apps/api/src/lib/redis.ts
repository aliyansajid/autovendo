import Redis from "ioredis";

declare global {
  var _redis: Redis | null | undefined;
}

function createRedis(): Redis | null {
  if (!process.env.REDIS_URL) return null;

  const client = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    lazyConnect: true,
    enableOfflineQueue: false,
    connectTimeout: 2000,
  });

  client.on("error", (err: Error) => {
    console.error("[Redis] Error:", err.message);
  });

  return client;
}

export function getRedis(): Redis | null {
  if (!global._redis) {
    global._redis = createRedis();
  }
  return global._redis;
}
