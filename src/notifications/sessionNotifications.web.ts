import { createSessionScheduler } from "#src/notifications/sessionScheduler";

export const notificationsSupported = false;
export async function requestSessionPermission() {
  return false;
}
export const sessionNotifications = createSessionScheduler({
  permitted: async () => false,
  cancel: async () => {},
  schedule: async () => {},
});
