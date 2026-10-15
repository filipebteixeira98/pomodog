type SvgImage = {
  toDataURL: (callback: (image: string) => void, options: object) => void;
};

export function progressPng(
  svg: SvgImage,
  signal: AbortSignal,
  timeoutMs = 8000,
) {
  return new Promise<string>((resolve, reject) => {
    let finished = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const finish = (error?: Error, image?: string) => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      signal.removeEventListener("abort", aborted);
      if (error) reject(error);
      else resolve(image!);
    };
    const aborted = () => finish(new Error("progress-image-cancelled"));
    if (signal.aborted) {
      aborted();
      return;
    }
    signal.addEventListener("abort", aborted, { once: true });
    timeout = setTimeout(
      () => finish(new Error("progress-image-timeout")),
      timeoutMs,
    );
    try {
      svg.toDataURL(
        (value) => {
          const image = value.replace(/^data:image\/png;base64,/, "");
          if (
            !image.startsWith("iVBORw0KGgo") ||
            image.length > 5_000_000 ||
            !/^[A-Za-z0-9+/]+={0,2}$/.test(image)
          ) {
            finish(new Error("progress-image-invalid"));
            return;
          }
          finish(undefined, image);
        },
        { width: 1080, height: 1350 },
      );
    } catch {
      finish(new Error("progress-image-unavailable"));
    }
  });
}

export function createProgressShareAction({
  capture,
  deliver,
}: {
  capture: (signal: AbortSignal) => Promise<string>;
  deliver: (image: string, signal: AbortSignal) => Promise<void>;
}) {
  let pending: AbortController | null = null;
  return {
    busy: () => pending !== null,
    cancel: () => pending?.abort(),
    async run() {
      if (pending) return false;
      const request = new AbortController();
      pending = request;
      try {
        const image = await capture(request.signal);
        if (request.signal.aborted) return false;
        await deliver(image, request.signal);
        return !request.signal.aborted;
      } finally {
        pending = null;
      }
    },
  };
}
