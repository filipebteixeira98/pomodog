export const taskNameLimit = 60;

export function normalizeTask(value: unknown): string | undefined {
  if (typeof value !== "string" || value.length > taskNameLimit) return;
  const task = value
    .replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return task || undefined;
}
