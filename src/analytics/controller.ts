import { eventPayload, type UsageEvent } from "#src/analytics/events.ts";

export type AnalyticsAdapter = {
  supported: boolean;
  read: () => Promise<string | null>;
  write: (value: string) => Promise<void>;
  configure: (enabled: boolean) => Promise<void>;
  log: (
    name: string,
    payload: Record<string, string | number>,
  ) => void | Promise<void>;
  diagnose?: (
    stage: "restore" | "consent" | "event",
    event?: UsageEvent["name"],
  ) => void;
};

/** Consent is device-local, independent of account and diagnostic consent. */
export function createAnalytics(adapter: AnalyticsAdapter) {
  let enabled = false;
  let ready = false;
  let revision = 0;
  let queue = Promise.resolve();
  let restoring: Promise<void> | undefined;
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((listener) => listener());
  function enqueue(operation: () => Promise<void>) {
    const task = queue.catch(() => {}).then(operation);
    queue = task;
    return task;
  }
  return {
    supported: adapter.supported,
    enabled: () => enabled,
    ready: () => ready,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    restore() {
      if (restoring) return restoring;
      const request = revision;
      restoring = enqueue(async () => {
        try {
          if (!adapter.supported) return;
          const value = await adapter.read();
          if (request !== revision) return;
          await adapter.configure(value === "enabled");
          if (request === revision) enabled = value === "enabled";
        } catch {
          adapter.diagnose?.("restore");
          enabled = false;
          await adapter.configure(false).catch(() => {});
        } finally {
          ready = true;
          notify();
        }
      });
      return restoring;
    },
    set(value: boolean) {
      const request = ++revision;
      // Immediately close the JS gate. Queued events from an older grant are discarded.
      enabled = false;
      notify();
      return enqueue(async () => {
        if (!adapter.supported || (value && request !== revision)) return;
        try {
          if (!value) await adapter.configure(false);
          await adapter.write(value ? "enabled" : "disabled");
          if (value && request === revision) {
            await adapter.configure(true);
            if (request === revision) enabled = true;
            else await adapter.configure(false);
          }
        } catch (error) {
          adapter.diagnose?.("consent");
          enabled = false;
          await adapter.configure(false).catch(() => {});
          await adapter.write("disabled").catch(() => {});
          throw error;
        } finally {
          ready = true;
          notify();
        }
      });
    },
    track(event: UsageEvent) {
      if (!adapter.supported || !ready || !enabled) return;
      const payload = eventPayload(event);
      if (!payload) return;
      const name = event.name;
      const request = revision;
      void enqueue(async () => {
        if (enabled && request === revision) await adapter.log(name, payload);
      }).catch(() => {
        adapter.diagnose?.("event", name);
      }); // Measurement must never interrupt a session.
    },
  };
}
