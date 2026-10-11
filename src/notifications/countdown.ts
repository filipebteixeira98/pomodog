// Live countdowns are currently supported by the Android system notification.
import type { NotificationAdapter } from "#src/notifications/sessionScheduler";

export const countdownSupported = false;
export const countdown: NotificationAdapter["countdown"] = undefined;
