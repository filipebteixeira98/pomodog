import type { ConsentSource } from "#src/privacy/consentJournal.ts";

type CollectionAdapter = {
  reporting: (enabled: boolean, source?: ConsentSource) => Promise<void>;
  usage: (enabled: boolean, source?: ConsentSource) => Promise<void>;
};

/** Both choices must finish before entering the tour; failed grants are revoked. */
export async function saveCollectionChoice(
  enabled: boolean,
  adapter: CollectionAdapter,
) {
  const results = await Promise.allSettled([
    adapter.reporting(enabled, "onboarding"),
    adapter.usage(enabled, "onboarding"),
  ]);
  if (results.some((result) => result.status === "rejected")) {
    if (enabled)
      await Promise.allSettled([
        adapter.reporting(false, "rollback"),
        adapter.usage(false, "rollback"),
      ]);
    throw new Error("optional-collection-choice-failed");
  }
}
