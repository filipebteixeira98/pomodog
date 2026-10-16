import { Platform } from "react-native";
import {
  AndroidImportance,
  cancelScheduledNotificationAsync,
  dismissNotificationAsync,
  getPermissionsAsync,
  IosAuthorizationStatus,
  requestPermissionsAsync,
  SchedulableTriggerInputTypes,
  scheduleNotificationAsync,
  setNotificationChannelAsync,
} from "expo-notifications";

import type { CalendarSuggestion } from "#src/calendar/model";

export const CALENDAR_NOTIFICATION_ID = "pomodog-calendar-suggestion";
const channelId = "pomodog-calendar";
async function channel() {
  if (Platform.OS === "android")
    await setNotificationChannelAsync(channelId, {
      name: "Sugestões da agenda",
      importance: AndroidImportance.DEFAULT,
    });
}
export const calendarNotifications = {
  async permitted() {
    const result = await getPermissionsAsync();
    return (
      result.granted ||
      result.ios?.status === IosAuthorizationStatus.PROVISIONAL
    );
  },
  async request() {
    await channel();
    if (await this.permitted()) return true;
    const current = await getPermissionsAsync();
    if (!current.canAskAgain) return false;
    const result = await requestPermissionsAsync({
      ios: { allowAlert: true, allowSound: true, allowBadge: false },
    });
    return (
      result.granted ||
      result.ios?.status === IosAuthorizationStatus.PROVISIONAL
    );
  },
  async cancel() {
    await cancelScheduledNotificationAsync(CALENDAR_NOTIFICATION_ID);
    await dismissNotificationAsync(CALENDAR_NOTIFICATION_ID);
  },
  async schedule(suggestion: CalendarSuggestion) {
    await channel();
    await scheduleNotificationAsync({
      identifier: CALENDAR_NOTIFICATION_ID,
      content: {
        title: "Um espaço para você",
        body: `Que tal um foco às ${new Date(suggestion.start).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}? No seu ritmo, antes dos compromissos.`,
        sound: "default",
        data: { feature: "calendar" },
      },
      trigger: {
        type: SchedulableTriggerInputTypes.DATE,
        date: new Date(suggestion.notifyAt),
        channelId,
      },
    });
  },
};
