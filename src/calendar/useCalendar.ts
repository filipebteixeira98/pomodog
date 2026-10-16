import { useEffect, useSyncExternalStore } from "react";
import { AppState } from "react-native";

import { calendarSupported } from "#src/calendar/authorization";
import { calendar } from "#src/calendar/service";

export function useCalendar(
  owner: string,
  enabled: boolean,
  focus: number,
  rest: number,
) {
  const state = useSyncExternalStore(
    calendar.subscribe,
    calendar.getSnapshot,
    calendar.getSnapshot,
  );
  useEffect(() => {
    if (!enabled || !calendarSupported) return;
    let active = true;
    void calendar.activate(owner).then(() => {
      if (active) void calendar.refresh();
    });
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void calendar.refresh();
    });
    return () => {
      active = false;
      subscription.remove();
      void calendar.stop().catch(() => {});
    };
  }, [owner, enabled]);
  useEffect(() => {
    calendar.setDurations(focus, rest);
    if (enabled && calendarSupported) void calendar.refresh(true);
  }, [focus, rest, enabled]);
  return state.record && state.record.owner !== owner
    ? { ...state, ready: false, record: null, notice: "" }
    : state;
}
