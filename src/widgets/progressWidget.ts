import type { Timer } from "#src/timer.ts";

export type ProgressWidgetNative = {
  begin: (owner: string) => Promise<string>;
  update: (token: string, payload: string) => Promise<void>;
  end: (token: string) => Promise<void>;
  clear: () => Promise<void>;
  updateForOwner: (owner: string, payload: string) => Promise<void>;
};

// Only times and durations are needed. A running focus is counted by Android
// after its deadline; replacing the snapshot on pause/reset prevents false credit.
export function widgetPayload(timer: Timer): string {
  const sessions = timer.sessions
    .slice(-1000)
    .map(({ endedAt, seconds }) => [endedAt, seconds]);
  if (
    timer.status === "running" &&
    timer.mode === "focus" &&
    timer.deadline !== null &&
    !timer.sessions.some(({ id }) => id === String(timer.deadline))
  )
    sessions.push([timer.deadline, timer.duration]);
  return JSON.stringify(sessions);
}

export function connectProgressWidget(
  native: ProgressWidgetNative,
  owner: string,
) {
  let closed = false;
  const token = native.begin(owner);
  return {
    async update(timer: Timer) {
      const current = await token;
      if (!closed) await native.update(current, widgetPayload(timer));
    },
    async close() {
      closed = true;
      await native.end(await token);
    },
  };
}
