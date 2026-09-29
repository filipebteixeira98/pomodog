import { Platform } from "react-native";
import {
  AndroidImportance,
  cancelScheduledNotificationAsync,
  getAllScheduledNotificationsAsync,
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

function devLog(message: string) {
  if (typeof __DEV__ !== "undefined" && __DEV__)
    console.info(`[Pomodog notifications] ${message}`);
}

export const sessionNotifications = createSessionScheduler({
  permitted: async () => {
    const result = await notificationOperation(
      "permissions",
      getPermissionsAsync,
    );
    devLog(`permitted=${allowed(result)}`);
    return allowed(result);
  },
  cancel: async () => {
    await notificationOperation("cancel", () =>
      cancelScheduledNotificationAsync(SESSION_NOTIFICATION_ID),
    );
    devLog("cancelled");
  },
  schedule: async (deadline, mode) => {
    await channel();
    const id = await notificationOperation("schedule", () =>
      scheduleNotificationAsync({
        identifier: SESSION_NOTIFICATION_ID,
        content: {
          title: mode === "focus" ? "Seu foco terminou" : "Sua pausa terminou",
          body:
            mode === "focus"
              ? "Mais um passo concluído. Que tal descansar um pouco?"
              : "Vamos para o próximo foco? No seu ritmo.",
          sound: "default",
          data: { deadline, mode },
        },
        trigger: {
          type: SchedulableTriggerInputTypes.DATE,
          date: new Date(deadline),
          channelId,
        },
      }),
    );
    devLog(`scheduled id=${id} mode=${mode} deadline=${deadline}`);
  },
  pending: async () => {
    const all = await notificationOperation(
      "schedule",
      getAllScheduledNotificationsAsync,
    );
    const match = all.find((n) => n.identifier === SESSION_NOTIFICATION_ID);
    if (!match) {
      devLog("pending=none");
      return null;
    }
    const data = match.content.data as { deadline?: unknown; mode?: unknown };
    if (
      typeof data?.deadline !== "number" ||
      (data.mode !== "focus" && data.mode !== "break")
    ) {
      devLog("pending=invalid-metadata");
      return null;
    }
    devLog(`pending mode=${data.mode} deadline=${data.deadline}`);
    return { deadline: data.deadline, mode: data.mode };
  },
});
