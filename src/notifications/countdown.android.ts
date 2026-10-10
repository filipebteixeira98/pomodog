import { NativeModules } from "react-native";

import { notificationOperation } from "#src/notifications/diagnostics";
import type { NotificationAdapter } from "#src/notifications/sessionScheduler";

type CountdownModule = {
  show: (deadline: number, mode: string) => Promise<void>;
  hide: () => Promise<void>;
};

const native = NativeModules.PomodogCountdown as CountdownModule | undefined;
export const countdownSupported = true;
export const countdown: NotificationAdapter["countdown"] = {
  show: (deadline, mode) =>
    notificationOperation("countdown", async () => {
      if (!native)
        throw new Error("Countdown requires a new development build");
      await native.show(deadline, mode);
    }),
  hide: () => notificationOperation("countdown", async () => native?.hide()),
};
