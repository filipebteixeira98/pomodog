type CollectionAdapter = {
  reporting: (enabled: boolean) => Promise<void>;
  usage: (enabled: boolean) => Promise<void>;
};

/** Both choices must finish before entering the tour; failed grants are revoked. */
export async function saveCollectionChoice(
  enabled: boolean,
  adapter: CollectionAdapter,
) {
  const results = await Promise.allSettled([
    adapter.reporting(enabled),
    adapter.usage(enabled),
  ]);
  if (results.some((result) => result.status === "rejected")) {
    if (enabled)
      await Promise.allSettled([
        adapter.reporting(false),
        adapter.usage(false),
      ]);
    throw new Error("optional-collection-choice-failed");
  }
}
