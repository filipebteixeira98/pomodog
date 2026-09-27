import { Platform } from "react-native";
// Import local-only modules: the package entrypoint initializes remote push registration.
import { cancelScheduledNotificationAsync } from "expo-notifications/build/cancelScheduledNotificationAsync";
import { AndroidImportance } from "expo-notifications/build/NotificationChannelManager.types";
import {
  getPermissionsAsync,
  requestPermissionsAsync,
} from "expo-notifications/build/NotificationPermissions";
import {
  IosAuthorizationStatus,
  type NotificationPermissionsStatus,
} from "expo-notifications/build/NotificationPermissions.types";
import { SchedulableTriggerInputTypes } from "expo-notifications/build/Notifications.types";
import { setNotificationHandler } from "expo-notifications/build/NotificationsHandler";
import { scheduleNotificationAsync } from "expo-notifications/build/scheduleNotificationAsync";
import { setNotificationChannelAsync } from "expo-notifications/build/setNotificationChannelAsync";

import { notificationOperation } from "#src/notifications/diagnostics";
import {
  createSessionScheduler,
  SESSION_NOTIFICATION_ID,
} from "#src/notifications/sessionScheduler";

const channelId = "pomodog-sessions";
export const notificationsSupported = true;

setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function channel() {
  if (Platform.OS === "android") {
    await notificationOperation("channel", () =>
      setNotificationChannelAsync(channelId, {
        name: "Conclusão de sessões",
        importance: AndroidImportance.HIGH,
        sound: "default",
      }),
    );
  }
}

function allowed(permission: NotificationPermissionsStatus) {
  return (
    permission.granted ||
    permission.ios?.status === IosAuthorizationStatus.PROVISIONAL
  );
}

export async function requestSessionPermission() {
  await channel();
  const current = await notificationOperation(
    "permissions",
    getPermissionsAsync,
  );
  if (allowed(current)) return true;
  if (!current.canAskAgain) return false;
  return allowed(
    await notificationOperation("request", () =>
      requestPermissionsAsync({
        android: {},
        ios: { allowAlert: true, allowSound: true, allowBadge: false },
      }),
    ),
  );
}

export const sessionNotifications = createSessionScheduler({
  permitted: async () =>
    allowed(await notificationOperation("permissions", getPermissionsAsync)),
  cancel: async () => {
    await notificationOperation("cancel", () =>
      cancelScheduledNotificationAsync(SESSION_NOTIFICATION_ID),
    );
  },
  schedule: async (deadline, mode) => {
    await channel();
    await notificationOperation("schedule", () =>
      scheduleNotificationAsync({
        identifier: SESSION_NOTIFICATION_ID,
        content: {
          title: mode === "focus" ? "Seu foco terminou" : "Sua pausa terminou",
          body:
            mode === "focus"
              ? "Mais um passo concluído. Que tal descansar um pouco?"
              : "Vamos para o próximo foco? No seu ritmo.",
          sound: "default",
        },
        trigger: {
          type: SchedulableTriggerInputTypes.DATE,
          date: new Date(deadline),
          channelId,
        },
      }),
    );
  },
});
