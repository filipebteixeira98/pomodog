import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

import {
  createSessionScheduler,
  SESSION_NOTIFICATION_ID,
} from "#src/notifications/sessionScheduler";

const channelId = "pomodog-sessions";
export const notificationsSupported = true;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function channel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(channelId, {
      name: "Conclusão de sessões",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
    });
  }
}

function allowed(permission: Notifications.NotificationPermissionsStatus) {
  return (
    permission.granted ||
    permission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

export async function requestSessionPermission() {
  await channel();
  const current = await Notifications.getPermissionsAsync();
  if (allowed(current)) return true;
  if (!current.canAskAgain) return false;
  return allowed(
    await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowSound: true, allowBadge: false },
    }),
  );
}

export const sessionNotifications = createSessionScheduler({
  permitted: async () => allowed(await Notifications.getPermissionsAsync()),
  cancel: async () => {
    await Notifications.cancelScheduledNotificationAsync(
      SESSION_NOTIFICATION_ID,
    );
  },
  schedule: async (deadline, mode) => {
    await channel();
    await Notifications.scheduleNotificationAsync({
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
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(deadline),
        channelId,
      },
    });
  },
});
