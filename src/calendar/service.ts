import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  authorizeCalendar,
  calendarAccessToken,
  forgetCalendarToken,
} from "#src/calendar/authorization";
import { queryFreeBusy } from "#src/calendar/freeBusy";
import { createCalendarIntegration } from "#src/calendar/integration";
import { calendarNotifications } from "#src/calendar/notifications";

export const CALENDAR_STORAGE_KEY = "pomodog.calendar.v1";
export const calendar = createCalendarIntegration({
  read: () => AsyncStorage.getItem(CALENDAR_STORAGE_KEY),
  write: (record) =>
    AsyncStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(record)),
  remove: () => AsyncStorage.removeItem(CALENDAR_STORAGE_KEY),
  authorize: authorizeCalendar,
  token: calendarAccessToken,
  forget: forgetCalendarToken,
  query: queryFreeBusy,
  notifications: calendarNotifications,
});
