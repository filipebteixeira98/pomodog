export async function clearProgressImages() {}

// Keep generated images local on web too; download without uploading to a server.
export async function shareProgressImage(image: string, signal: AbortSignal) {
  if (signal.aborted) return;
  const bytes = Uint8Array.from(atob(image), (character) =>
    character.charCodeAt(0),
  );
  const url = URL.createObjectURL(new Blob([bytes], { type: "image/png" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "pomodog-meu-progresso.png";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
