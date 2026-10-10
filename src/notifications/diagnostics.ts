const descriptions = {
  channel: "Não foi possível preparar o canal de avisos.",
  permissions: "Não foi possível consultar a permissão de notificações.",
  request: "Não foi possível solicitar permissão de notificações.",
  cancel: "Não foi possível cancelar o aviso agendado.",
  schedule: "Não foi possível agendar o aviso de conclusão.",
  countdown: "Não foi possível atualizar o timer nas notificações.",
} as const;

type Stage = keyof typeof descriptions;

export class NotificationFailure extends Error {
  readonly stage: Stage;
  constructor(stage: Stage, cause: unknown) {
    super(descriptions[stage], { cause });
    this.name = "NotificationFailure";
    this.stage = stage;
  }
}

export async function notificationOperation<T>(
  stage: Stage,
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  } catch (cause) {
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.warn(
        `[Pomodog notifications] ${stage}\n${describeNativeError(cause)}`,
      );
    }
    throw new NotificationFailure(stage, cause);
  }
}

export function notificationErrorMessage(error: unknown) {
  if (error instanceof NotificationFailure)
    return `${error.message} Tente novamente.`;
  if (error instanceof Error && error.message === "notification-permission")
    return "Permita notificações nos ajustes do dispositivo para receber o aviso.";
  if (typeof __DEV__ !== "undefined" && __DEV__)
    console.warn("[Pomodog notifications] unexpected", error);
  return "Não foi possível atualizar os avisos. Tente novamente.";
}

/** Explicit fields include non-enumerable Error.message; cap and guard cause cycles. */
export function describeNativeError(value: unknown): string {
  const seen = new Set<unknown>();
  const lines: string[] = [];
  let current = value;
  for (
    let depth = 0;
    current != null && depth < 4 && !seen.has(current);
    depth++
  ) {
    seen.add(current);
    if (typeof current !== "object") {
      lines.push(String(current));
      break;
    }
    const error = current as {
      name?: unknown;
      code?: unknown;
      message?: unknown;
      cause?: unknown;
    };
    const parts = [error.name, error.code, error.message].filter(
      (v) => typeof v === "string" && v.length,
    );
    lines.push(parts.length ? parts.join(": ") : "Erro nativo sem mensagem.");
    current = error.cause;
  }
  return (lines.join("\nCausa: ") || "Erro nativo sem mensagem.").slice(
    0,
    4000,
  );
}
