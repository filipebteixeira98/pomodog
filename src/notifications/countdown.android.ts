import { NativeModules } from "react-native";

import { notificationOperation } from "#src/notifications/diagnostics";
import type { NotificationAdapter } from "#src/notifications/sessionScheduler";

type CountdownModule = {
  show: (deadline: number, mode: string, owner: string) => Promise<void>;
  showPaused: (remaining: number, mode: string, owner: string) => Promise<void>;
  isCurrent: (token: string, owner: string) => Promise<boolean>;
  hide: () => Promise<void>;
};

const native = NativeModules.PomodogCountdown as CountdownModule | undefined;
export const countdownSupported = true;
export const countdown: NotificationAdapter["countdown"] = {
  show: (deadline, mode, owner = "guest") =>
    notificationOperation("countdown", async () => {
      if (!native)
        throw new Error("Countdown requires a new development build");
      await native.show(deadline, mode, owner);
    }),
  showPaused: (remaining, mode, owner = "guest") =>
    notificationOperation("countdown", async () => {
      if (!native)
        throw new Error("Countdown controls require a new development build");
      await native.showPaused(remaining, mode, owner);
    }),
  isCurrent: async (token, owner) => native?.isCurrent(token, owner) ?? false,
  hide: () => notificationOperation("countdown", async () => native?.hide()),
};
