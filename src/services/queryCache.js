const DEFAULT_TTL = 60_000;

const cache = new Map();

function now() {
  return Date.now();
}

function normalizeKey(parts) {
  return Array.isArray(parts) ? parts.join(':') : String(parts);
}

export function clearQueryCache(prefix = '') {
  const normalizedPrefix = String(prefix);
  if (!normalizedPrefix) {
    cache.clear();
    return;
  }

  for (const key of cache.keys()) {
    if (key.startsWith(normalizedPrefix)) {
      cache.delete(key);
    }
  }
}

export async function cachedQuery(keyParts, loader, options = {}) {
  const key = normalizeKey(keyParts);
  const ttl = options.ttl ?? DEFAULT_TTL;
  const cached = cache.get(key);

  if (cached && cached.expiresAt > now()) {
    if (cached.promise) return cached.promise;
    return cached.value;
  }

  const promise = Promise.resolve()
    .then(loader)
    .then((value) => {
      cache.set(key, {
        value,
        promise: null,
        expiresAt: now() + ttl,
      });
      return value;
    })
    .catch((error) => {
      cache.delete(key);
      throw error;
    });

  cache.set(key, {
    value: cached?.value,
    promise,
    expiresAt: now() + ttl,
  });

  return promise;
}
