import { Platform } from "react-native";

import { calendarScope } from "#src/calendar/freeBusy";
import { CalendarError } from "#src/calendar/model";
import { GoogleSignin } from "#src/google/client";

export const calendarSupported = Platform.OS === "android";
let lastToken: string | null = null;

export async function authorizeCalendar() {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const restored = await GoogleSignin.signInSilently();
  if (restored.type !== "success") {
    const signedIn = await GoogleSignin.signIn();
    if (signedIn.type === "cancelled") return null;
  }
  const response = await GoogleSignin.addScopes({ scopes: [calendarScope] });
  if (!response || response.type !== "success") return null;
  if (!response.data.scopes.includes(calendarScope))
    throw new CalendarError("authorization");
  return response.data.user.id;
}

export async function calendarAccessToken(googleId: string) {
  const response = await GoogleSignin.signInSilently();
  if (
    response.type !== "success" ||
    response.data.user.id !== googleId ||
    !response.data.scopes.includes(calendarScope)
  )
    throw new CalendarError("authorization");
  const { accessToken } = await GoogleSignin.getTokens();
  lastToken = accessToken;
  return accessToken;
}

// Google revocation affects the entire OAuth grant, including normal sign-in.
// Stop app access here; full revocation remains available in the user's Google account.
export async function forgetCalendarToken() {
  const token = lastToken;
  lastToken = null;
  if (token) await GoogleSignin.clearCachedAccessToken(token);
}
