const descriptions = {
  channel: "Não foi possível preparar o canal de avisos.",
  permissions: "Não foi possível consultar a permissão de notificações.",
  request: "Não foi possível solicitar permissão de notificações.",
  cancel: "Não foi possível cancelar o aviso agendado.",
  schedule: "Não foi possível agendar o aviso de conclusão.",
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
      // Local development diagnostics only. Never log notification content or user history.
      const error = cause as {
        code?: unknown;
        message?: unknown;
        stack?: unknown;
      } | null;
      console.warn(`[Pomodog notifications] ${stage}`, {
        code: error?.code,
        message: error?.message ?? String(cause),
        stack: error?.stack,
      });
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
