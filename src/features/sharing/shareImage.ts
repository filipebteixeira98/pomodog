import * as FileSystem from "expo-file-system/legacy";

import { expiredProgressImages } from "#src/features/sharing/progressShare";

let revision = 0;
const cacheDirectory = () =>
  FileSystem.cacheDirectory
    ? `${FileSystem.cacheDirectory}pomodog-shares/`
    : null;

export async function clearProgressImages() {
  revision++;
  const directory = cacheDirectory();
  if (directory) await FileSystem.deleteAsync(directory, { idempotent: true });
}

export async function shareProgressImage(image: string, signal: AbortSignal) {
  const version = revision;
  const active = () => {
    if (signal.aborted || version !== revision)
      throw new Error("progress-share-cancelled");
  };
  active();
  // Lazy loading keeps older development builds able to open the app/preview.
  const Sharing = await import("expo-sharing");
  if (!(await Sharing.isAvailableAsync()))
    throw new Error("progress-share-unavailable");
  active();
  const directory = cacheDirectory();
  if (!directory) throw new Error("progress-share-cache-unavailable");
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  active();
  for (const name of expiredProgressImages(
    await FileSystem.readDirectoryAsync(directory),
  )) {
    active();
    await FileSystem.deleteAsync(`${directory}${name}`, { idempotent: true });
  }
  active();
  const suffix = Math.random().toString(16).slice(2, 10).padEnd(8, "0");
  const uri = `${directory}pomodog-${Date.now()}-${suffix}.png`;
  let handedOff = false;
  try {
    await FileSystem.writeAsStringAsync(uri, image, {
      encoding: FileSystem.EncodingType.Base64,
    });
    active();
    handedOff = true;
    await Sharing.shareAsync(uri, {
      mimeType: "image/png",
      UTI: "public.png",
      dialogTitle: "Compartilhe seu progresso",
    });
  } finally {
    // Chooser completion does not mean the receiving app has finished reading.
    if (!handedOff || signal.aborted || version !== revision)
      await FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {});
  }
}
