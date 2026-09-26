import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

function exportPath() {
  if (!FileSystem.cacheDirectory) throw new Error("Cache unavailable");
  return `${FileSystem.cacheDirectory}pomodog-export.json`;
}

export async function exportFile(json: string): Promise<void> {
  if (!(await Sharing.isAvailableAsync()))
    throw new Error("Sharing unavailable");
  const path = exportPath();
  await FileSystem.writeAsStringAsync(path, json, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  await Sharing.shareAsync(path, {
    mimeType: "application/json",
    dialogTitle: "Guardar meus dados do Pomodog",
    UTI: "public.json",
  });
}

export async function clearExportFile(): Promise<void> {
  await FileSystem.deleteAsync(exportPath(), { idempotent: true });
}
