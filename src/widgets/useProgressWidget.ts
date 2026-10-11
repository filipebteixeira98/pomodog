import { useEffect, useRef } from "react";
import { AppState } from "react-native";

import { reportError } from "#src/monitoring/sentry";
import type { Timer } from "#src/timer";
import { nativeProgress } from "#src/widgets/nativeProgress";
import { connectProgressWidget } from "#src/widgets/progressWidget";

export function useProgressWidget(
  timer: Timer,
  owner: string,
  enabled: boolean,
) {
  const scope = useRef<ReturnType<typeof connectProgressWidget> | null>(null);
  const latest = useRef(timer);
  latest.current = timer;
  useEffect(() => {
    if (!enabled || !nativeProgress) return;
    const connection = connectProgressWidget(nativeProgress, owner);
    scope.current = connection;
    const resumed = AppState.addEventListener("change", (state) => {
      if (state === "active")
        void connection.update(latest.current).catch(failed);
    });
    return () => {
      scope.current = null;
      resumed.remove();
      void connection.close().catch(failed);
    };
  }, [enabled, owner]);
  useEffect(() => {
    void scope.current?.update(latest.current).catch(failed);
    // Publish transitions/history, never the remaining-time ticks.
  }, [
    enabled,
    owner,
    timer.sessions,
    timer.mode,
    timer.status,
    timer.deadline,
  ]);
}

function failed(error: unknown) {
  reportError(error, "widget.sync");
}
