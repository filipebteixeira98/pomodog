import { parseSavedPrototype, type SavedPrototype } from "./savedPrototype.ts";

export function serializeExport(
  value: SavedPrototype,
  now = Date.now(),
): string {
  const data = parseSavedPrototype(value);
  if (!data) throw new Error("Cannot export invalid data");
  return JSON.stringify(
    {
      application: "pomodog",
      exportVersion: 1,
      exportedAt: new Date(now).toISOString(),
      data,
    },
    null,
    2,
  );
}
