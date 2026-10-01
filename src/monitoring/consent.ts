type Adapter = {
  read: () => Promise<string | null>;
  write: (value: string) => Promise<void>;
  initialize: () => void;
};

/** Diagnostic consent stays on this device, outside account synchronization. */
export function createReportingConsent(adapter: Adapter) {
  let enabled = false;
  let ready = false;
  let revision = 0;
  let writes = Promise.resolve();
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((listener) => listener());
  return {
    enabled: () => enabled,
    ready: () => ready,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    async restore() {
      const request = revision;
      try {
        const saved = await adapter.read();
        if (request === revision) {
          if (saved === "enabled") adapter.initialize();
          enabled = saved === "enabled";
        }
      } catch {
        if (request === revision) enabled = false;
      } finally {
        ready = true;
        notify();
      }
    },
    async set(value: boolean) {
      const request = ++revision;
      if (!value) {
        enabled = false;
        notify();
      }
      const save = writes
        .catch(() => {})
        .then(() => {
          // A superseded activation must never initialize the native collector.
          if (value && request !== revision) return;
          return adapter.write(value ? "enabled" : "disabled");
        });
      writes = save;
      await save;
      if (value && request === revision) {
        adapter.initialize();
        enabled = true;
      }
      ready = true;
      notify();
    },
  };
}
