import {
  parseSavedPrototype,
  type SavedPrototype,
} from "#src/domain/savedPrototype.ts";

export const STORAGE_KEY = "pomodog.prototype.v1";
export const MAX_STORAGE_LENGTH = 1_000_000;
type StorageAdapter = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<unknown>;
  removeItem: (key: string) => Promise<unknown>;
};

/** Serializes reads, writes and deletion; unreadable data is never silently overwritten. */
export function createPrototypeStore(
  storage: StorageAdapter,
  key = STORAGE_KEY,
) {
  let queue: Promise<unknown> = Promise.resolve();
  let blocked = false;
  function enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const result = queue.then(operation);
    queue = result.catch(() => {});
    return result;
  }
  return {
    load: () =>
      enqueue(async () => {
        try {
          const raw = await storage.getItem(key);
          if (raw === null) {
            blocked = false;
            return null;
          }
          if (raw.length > MAX_STORAGE_LENGTH)
            throw new Error("Saved data exceeds the size limit");
          const saved = parseSavedPrototype(JSON.parse(raw));
          if (!saved) throw new Error("Invalid saved prototype");
          blocked = false;
          return saved;
        } catch (error) {
          blocked = true;
          throw error;
        }
      }),
    save: (value: SavedPrototype) =>
      enqueue(async () => {
        if (blocked)
          throw new Error("Explicit recovery required before saving");
        const saved = parseSavedPrototype(value);
        if (!saved) throw new Error("Invalid prototype");
        await storage.setItem(
          key,
          JSON.stringify({ schemaVersion: 1, ...saved }),
        );
      }),
    erase: () =>
      enqueue(async () => {
        await storage.removeItem(key);
        blocked = false;
      }),
  };
}
