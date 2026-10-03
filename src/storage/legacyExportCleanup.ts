import * as FileSystem from "expo-file-system/legacy";

// Exports were removed from the app. Still erase caches created by old versions.
export async function clearLegacyExport(): Promise<void> {
  if (!FileSystem.cacheDirectory) return;
  await FileSystem.deleteAsync(
    `${FileSystem.cacheDirectory}pomodog-export.json`,
    { idempotent: true },
  );
}
