export const feedbackCategories = ["Sugestão", "Problema", "Outro"] as const;
export const feedbackMessageLimit = 1000;
export const feedbackEmailLimit = 254;

export type FeedbackDraft = {
  category: (typeof feedbackCategories)[number];
  message: string;
  email: string;
};

export type FeedbackSubmission = {
  id: string;
  createdAt: string;
  feedback: FeedbackDraft;
};

export class FeedbackValidationError extends Error {}

function normalizeFeedback(input: FeedbackDraft): FeedbackDraft {
  if (!feedbackCategories.includes(input.category))
    throw new FeedbackValidationError("Escolha um tipo de feedback.");
  const message = input.message.trim();
  const email = input.email.trim();
  if (!message || message.length > feedbackMessageLimit)
    throw new FeedbackValidationError(
      "Escreva uma mensagem de até 1.000 caracteres.",
    );
  if (
    email &&
    (email.length > feedbackEmailLimit ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  )
    throw new FeedbackValidationError("Confira o e-mail ou deixe-o em branco.");
  return { category: input.category, message, email };
}

// These IDs deduplicate submissions; they never authorize access or identify accounts.
function submissionId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    (character) => {
      const value = Math.floor(Math.random() * 16);
      return (character === "x" ? value : (value & 3) | 8).toString(16);
    },
  );
}

type Adapter = {
  send: (submission: FeedbackSubmission, signal: AbortSignal) => Promise<void>;
  id?: () => string;
  now?: () => string;
  timeoutMs?: number;
};

export function createFeedbackSender({
  send,
  id = submissionId,
  now = () => new Date().toISOString(),
  timeoutMs = 12000,
}: Adapter) {
  let pending = false;
  let revision = 0;
  let controller: AbortController | null = null;
  let attempt: FeedbackSubmission | null = null;
  return {
    busy: () => pending,
    cancel() {
      revision++;
      controller?.abort();
      attempt = null;
    },
    async submit(input: FeedbackDraft) {
      if (pending) return false;
      const feedback = normalizeFeedback(input);
      if (
        !attempt ||
        attempt.feedback.category !== feedback.category ||
        attempt.feedback.message !== feedback.message ||
        attempt.feedback.email !== feedback.email
      )
        attempt = { id: id(), createdAt: now(), feedback };
      const submission = attempt;
      const request = revision;
      const abort = new AbortController();
      controller = abort;
      pending = true;
      let timeout: ReturnType<typeof setTimeout> | undefined;
      try {
        await Promise.race([
          send(submission, abort.signal),
          new Promise<never>((_, reject) => {
            timeout = setTimeout(() => {
              abort.abort();
              reject(new Error("feedback-timeout"));
            }, timeoutMs);
          }),
        ]);
        if (request !== revision) return false;
        attempt = null;
        return true;
      } finally {
        clearTimeout(timeout);
        pending = false;
        controller = null;
      }
    },
  };
}
