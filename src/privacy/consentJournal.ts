export type ConsentPurpose = "diagnostics" | "usage";
export type ConsentSource = "onboarding" | "settings" | "rollback" | "erasure";
export type ConsentReceipt = {
  id: string;
  purpose: ConsentPurpose;
  allowed: boolean;
  noticeVersion: string;
  decidedAt: number;
  source: ConsentSource;
  owner: string | null;
};
type Journal = {
  latest: Partial<Record<ConsentPurpose, ConsentReceipt>>;
  pending: ConsentReceipt[];
};
type Adapter = {
  read: () => Promise<string | null>;
  write: (value: string) => Promise<void>;
  id: () => string;
  now: () => number;
};

function validReceipt(value: unknown): value is ConsentReceipt {
  if (!value || typeof value !== "object") return false;
  const receipt = value as ConsentReceipt;
  return (
    typeof receipt.id === "string" &&
    /^[a-zA-Z0-9]{20}$/.test(receipt.id) &&
    ["diagnostics", "usage"].includes(receipt.purpose) &&
    typeof receipt.allowed === "boolean" &&
    typeof receipt.noticeVersion === "string" &&
    receipt.noticeVersion.length <= 32 &&
    Number.isSafeInteger(receipt.decidedAt) &&
    receipt.decidedAt >= 0 &&
    ["onboarding", "settings", "rollback", "erasure"].includes(
      receipt.source,
    ) &&
    (receipt.owner === null ||
      (typeof receipt.owner === "string" && receipt.owner.length > 0))
  );
}

/** Keep the latest device choices and an outbox bound to the owner at decision time. */
export function createConsentJournal(adapter: Adapter, noticeVersion: string) {
  let queue = Promise.resolve();
  function enqueue<T>(operation: () => Promise<T>) {
    const task = queue.catch(() => {}).then(operation);
    queue = task.then(
      () => {},
      () => {},
    );
    return task;
  }
  async function read(): Promise<Journal> {
    const saved = await adapter.read();
    if (!saved) return { latest: {}, pending: [] };
    const parsed = JSON.parse(saved) as Journal;
    if (
      !parsed?.latest ||
      typeof parsed.latest !== "object" ||
      Array.isArray(parsed.latest) ||
      !Array.isArray(parsed.pending) ||
      !Object.entries(parsed.latest).every(
        ([purpose, receipt]) =>
          validReceipt(receipt) && receipt.purpose === purpose,
      ) ||
      !parsed.pending.every(validReceipt)
    )
      throw new Error("invalid-consent-journal");
    return parsed;
  }
  return {
    clear: () =>
      enqueue(() => adapter.write(JSON.stringify({ latest: {}, pending: [] }))),
    granted(purpose: ConsentPurpose) {
      return enqueue(async () => {
        const receipt = (await read()).latest[purpose];
        return (
          receipt?.allowed === true && receipt.noticeVersion === noticeVersion
        );
      });
    },
    record(
      purpose: ConsentPurpose,
      allowed: boolean,
      source: ConsentSource,
      owner: string | null,
    ) {
      const receipt: ConsentReceipt = {
        id: adapter.id(),
        purpose,
        allowed,
        source,
        owner,
        noticeVersion,
        decidedAt: adapter.now(),
      };
      return enqueue(async () => {
        const journal = await read();
        if (!validReceipt(receipt)) throw new Error("invalid-consent-receipt");
        journal.latest[purpose] = receipt;
        if (owner) journal.pending.push(receipt);
        await adapter.write(JSON.stringify(journal));
      });
    },
    pending: () => enqueue(async () => (await read()).pending),
    acknowledge(id: string) {
      return enqueue(async () => {
        const journal = await read();
        journal.pending = journal.pending.filter(
          (receipt) => receipt.id !== id,
        );
        await adapter.write(JSON.stringify(journal));
      });
    },
    forgetOwner(owner: string | null) {
      return enqueue(async () => {
        const journal = await read();
        for (const purpose of ["diagnostics", "usage"] as const)
          if (journal.latest[purpose]?.owner === owner)
            delete journal.latest[purpose];
        journal.pending = journal.pending.filter(
          (receipt) => receipt.owner !== owner,
        );
        await adapter.write(JSON.stringify(journal));
      });
    },
  };
}

/** Persist evidence before a grant; refusals close collection even if storage fails. */
export function createRecordedConsent(
  purpose: ConsentPurpose,
  adapter: {
    set: (value: boolean) => Promise<void>;
    record: (
      purpose: ConsentPurpose,
      allowed: boolean,
      source: ConsentSource,
      owner: string | null,
    ) => Promise<void>;
    currentOwner: () => string | null;
    blocked: (owner: string) => boolean;
    sync: (owner: string) => void;
  },
) {
  let revision = 0;
  return async (allowed: boolean, source: ConsentSource = "settings") => {
    const request = ++revision;
    // Erasure closes collection without recreating personal evidence being deleted.
    if (source === "erasure") return adapter.set(false);
    const owner = adapter.currentOwner();
    const stopped = adapter.set(false);
    // Observe a rejection immediately while journal persistence is pending.
    const stopResult = stopped.then(
      () => ({ status: "fulfilled" as const }),
      (reason: unknown) => ({ status: "rejected" as const, reason }),
    );
    try {
      if (allowed && owner && adapter.blocked(owner))
        throw new Error("account-deletion-pending");
      await adapter.record(purpose, allowed, source, owner);
      const stop = await stopResult;
      if (stop.status === "rejected") throw stop.reason;
      if (allowed && request === revision) await adapter.set(true);
    } catch (error) {
      await stopResult;
      if (request === revision) {
        await adapter.set(false).catch(() => {});
        await adapter.record(purpose, false, "rollback", owner).catch(() => {});
      }
      throw error;
    } finally {
      if (owner) adapter.sync(owner);
    }
  };
}

export function createConsentSync(adapter: {
  pending: () => Promise<ConsentReceipt[]>;
  acknowledge: (id: string) => Promise<void>;
  currentOwner: () => string | null;
  blocked: (owner: string) => boolean;
  send: (receipt: ConsentReceipt) => Promise<void>;
}) {
  let queue = Promise.resolve();
  return {
    flush(owner: string) {
      const task = queue
        .catch(() => {})
        .then(async () => {
          for (const receipt of await adapter.pending()) {
            if (adapter.currentOwner() !== owner || adapter.blocked(owner))
              return;
            if (receipt.owner !== owner) continue;
            await adapter.send(receipt);
            await adapter.acknowledge(receipt.id);
          }
        });
      queue = task;
      return task;
    },
    drain: () => queue.catch(() => {}),
  };
}
