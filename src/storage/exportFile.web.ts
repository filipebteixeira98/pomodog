export async function exportFile(json: string): Promise<void> {
  const url = URL.createObjectURL(
    new Blob([json], { type: "application/json;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "pomodog-export.json";
  document.body.appendChild(link);
  try {
    link.click();
  } finally {
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

// A downloaded copy belongs to the user and cannot be removed by the app.
export async function clearExportFile(): Promise<void> {}
