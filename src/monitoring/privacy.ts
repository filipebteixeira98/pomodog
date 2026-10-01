import type { ErrorEvent } from "@sentry/core";

export const operations = {
  "account.prepare": "Account synchronization failed",
  "account.login": "Google sign-in failed",
  "account.logout": "Account sign-out failed",
  "account.delete": "Account deletion failed",
  "storage.load": "Local storage loading failed",
  "storage.save": "Local storage saving failed",
  "storage.erase": "Local storage deletion failed",
  "account.save": "Account persistence failed",
  "notifications.sync": "Notification synchronization failed",
  "notifications.permission": "Notification permission operation failed",
  "monitoring.verify": "Pomodog Sentry integration verification",
} as const;
export type ErrorOperation = keyof typeof operations;

/** Allowlist only debugging fields. Never send account/state, request, logs or error payloads. */
const sourceFilename = (value: string | undefined) =>
  value?.split(/[?#]/)[0].split(/[\\/]/).at(-1);

export function sanitizeErrorEvent(event: ErrorEvent): ErrorEvent | null {
  if (!event.exception?.values?.length) return null;
  const operation = event.tags?.operation;
  const known =
    typeof operation === "string" && Object.hasOwn(operations, operation)
      ? (operation as ErrorOperation)
      : undefined;
  return {
    type: event.type,
    event_id: event.event_id,
    timestamp: event.timestamp,
    platform: event.platform,
    release: event.release,
    dist: event.dist,
    environment: event.environment,
    level: "error",
    user: { ip_address: "0.0.0.0" },
    debug_meta: event.debug_meta
      ? {
          images: event.debug_meta.images
            ?.filter((image) => image.type === "sourcemap")
            .map((image) => ({
              type: "sourcemap",
              debug_id: image.debug_id,
              code_file: sourceFilename(image.code_file) ?? "index.bundle",
            })),
        }
      : undefined,
    tags: known ? { operation: known } : undefined,
    exception: {
      values: event.exception.values.map((value) => ({
        type: known ? "PomodogError" : "ApplicationError",
        value: known
          ? operations[known]
          : "Application error (message omitted for privacy)",
        mechanism: value.mechanism
          ? {
              type: value.mechanism.type,
              handled: value.mechanism.handled,
            }
          : undefined,
        stacktrace: value.stacktrace
          ? {
              frames: value.stacktrace.frames?.map((frame) => ({
                filename: sourceFilename(frame.filename),
                function: frame.function,
                lineno: frame.lineno,
                colno: frame.colno,
                in_app: frame.in_app,
              })),
            }
          : undefined,
      })),
    },
  };
}
