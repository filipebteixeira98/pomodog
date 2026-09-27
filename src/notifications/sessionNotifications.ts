import { Platform } from "react-native";
import {
  AndroidImportance,
  cancelScheduledNotificationAsync,
  getPermissionsAsync,
  IosAuthorizationStatus,
  requestPermissionsAsync,
  SchedulableTriggerInputTypes,
  scheduleNotificationAsync,
  setNotificationChannelAsync,
  setNotificationHandler,
  type NotificationPermissionsStatus,
} from "expo-notifications";

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
        // Omit sound to inherit Android defaults without resolving a sound resource.
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
