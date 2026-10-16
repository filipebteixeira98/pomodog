import { CalendarError, type BusyPeriod } from "#src/calendar/model.ts";

export const calendarScope =
  "https://www.googleapis.com/auth/calendar.freebusy";
const endpoint = "https://www.googleapis.com/calendar/v3/freeBusy";

export function parseFreeBusy(value: unknown, range: BusyPeriod): BusyPeriod[] {
  const data = value as {
    calendars?: Record<string, { errors?: unknown[]; busy?: unknown[] }>;
  } | null;
  // Only one calendar was requested. Google may resolve the "primary" alias.
  const calendars = data?.calendars ? Object.values(data.calendars) : [];
  const primary = calendars.length === 1 ? calendars[0] : null;
  if (
    !primary ||
    primary.errors?.length ||
    !Array.isArray(primary.busy) ||
    primary.busy.length > 4096
  )
    throw new CalendarError("network");
  return primary.busy
    .map((value) => {
      const interval = value as { start?: unknown; end?: unknown } | null;
      if (
        typeof interval?.start !== "string" ||
        typeof interval.end !== "string"
      )
        throw new CalendarError("network");
      const start = Date.parse(interval.start);
      const end = Date.parse(interval.end);
      if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end)
        throw new CalendarError("network");
      return {
        start: Math.max(start, range.start),
        end: Math.min(end, range.end),
      };
    })
    .filter((p) => p.end > p.start);
}

export async function queryFreeBusy(
  token: string,
  range: BusyPeriod,
  signal: AbortSignal,
  transport: typeof fetch = fetch,
  timeoutMs = 15_000,
) {
  if (signal.aborted) throw new CalendarError("network");
  const request = new AbortController();
  const abort = () => request.abort();
  if (signal.aborted) request.abort();
  signal.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(abort, timeoutMs);
  try {
    const response = await transport(endpoint, {
      method: "POST",
      redirect: "error",
      signal: request.signal,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        timeMin: new Date(range.start).toISOString(),
        timeMax: new Date(range.end).toISOString(),
        calendarExpansionMax: 1,
        items: [{ id: "primary" }],
      }),
    });
    const body = await response.text();
    if (request.signal.aborted) throw new CalendarError("network");
    if (body.length > 512_000) throw new CalendarError("network");
    if (response.status === 401) throw new CalendarError("authorization");
    if (response.status === 403) {
      if (
        /rateLimitExceeded|quotaExceeded|dailyLimitExceeded|userRateLimitExceeded/.test(
          body,
        )
      )
        throw new CalendarError("network");
      throw new CalendarError(
        /SERVICE_DISABLED|accessNotConfigured|serviceDisabled/.test(body)
          ? "configuration"
          : "authorization",
      );
    }
    if (!response.ok) throw new CalendarError("network");
    return parseFreeBusy(JSON.parse(body), range);
  } catch (error) {
    if (error instanceof CalendarError) throw error;
    throw new CalendarError("network");
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", abort);
  }
}
