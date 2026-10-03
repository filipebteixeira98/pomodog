export type AuthStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

// Firebase keys contain characters that SecureStore does not accept. Hex preserves
// every UTF-16 code unit without collisions or including credentials in the key.
function secureKey(key: string) {
  let encoded = "pomodog.auth.";
  for (let index = 0; index < key.length; index++)
    encoded += key.charCodeAt(index).toString(16).padStart(4, "0");
  return encoded;
}

/** Encrypt before removing legacy data; never fall back to plaintext on errors. */
export function createSecureAuthStore(
  secure: AuthStorage,
  legacy: AuthStorage,
): AuthStorage {
  let queue: Promise<unknown> = Promise.resolve();
  function enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const result = queue.then(operation);
    queue = result.catch(() => {});
    return result;
  }
  return {
    getItem: (key) =>
      enqueue(async () => {
        const target = secureKey(key);
        const encrypted = await secure.getItem(target);
        if (encrypted !== null) {
          await legacy.removeItem(key);
          return encrypted;
        }
        const previous = await legacy.getItem(key);
        if (previous === null) return null;
        await secure.setItem(target, previous);
        await legacy.removeItem(key);
        return previous;
      }),
    setItem: (key, value) =>
      enqueue(async () => {
        await secure.setItem(secureKey(key), value);
        await legacy.removeItem(key);
      }),
    removeItem: (key) =>
      enqueue(async () => {
        await legacy.removeItem(key);
        await secure.removeItem(secureKey(key));
      }),
  };
}
