import { summarizeStreak } from "#src/domain/progress.ts";
import type { Timer } from "#src/timer.ts";

const messages = {
  running: [
    "Que carinho bom! Sigo aqui enquanto você foca.",
    "Obrigado pelo petisco! Um passo de cada vez.",
  ],
  rest: [
    "Obrigado! Descansar também faz parte.",
    "Petisco para mim, uma pausa para você.",
  ],
  completed: [
    "Que bom estar com você! Cada sessão conta.",
    "Obrigado pelo carinho! Você deu mais um passo.",
  ],
  streak: [
    "Estamos criando um hábito juntos. No seu ritmo!",
    "Um dia de cada vez. Obrigado por estar aqui!",
  ],
  welcome: [
    "Que bom ter você aqui. Podemos recomeçar.",
    "Obrigado pelo carinho! Vamos no seu tempo.",
  ],
  start: [
    "Obrigado pelo carinho! Que tal um pequeno começo?",
    "Um petisco e um passo de cada vez. Vamos juntos?",
  ],
} as const;

export type PetCare = { lastFedAt: number; lastMessageId: string };

export function parsePetCare(value: unknown): PetCare | undefined {
  if (!value || typeof value !== "object") return undefined;
  const care = value as PetCare;
  if (
    !Number.isFinite(care.lastFedAt) ||
    care.lastFedAt < 0 ||
    care.lastFedAt > 8_640_000_000_000_000 ||
    typeof care.lastMessageId !== "string"
  )
    return undefined;
  const validId = Object.entries(messages).some(([group, phrases]) =>
    phrases.some((_, index) => care.lastMessageId === `${group}:${index}`),
  );
  return validId
    ? { lastFedAt: care.lastFedAt, lastMessageId: care.lastMessageId }
    : undefined;
}

export function choosePetResponse(
  timer: Timer,
  previous?: PetCare,
  now = Date.now(),
) {
  const group =
    timer.mode === "break"
      ? "rest"
      : timer.status === "running" || timer.status === "paused"
        ? "running"
        : timer.status === "completed"
          ? "completed"
          : summarizeStreak(timer.sessions, now).count > 0
            ? "streak"
            : timer.sessions.some((session) => session.endedAt <= now)
              ? "welcome"
              : "start";
  const index = previous?.lastMessageId === `${group}:0` ? 1 : 0;
  return {
    message: messages[group][index],
    care: { lastFedAt: now, lastMessageId: `${group}:${index}` },
  };
}
