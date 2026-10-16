export const calendarSupported = false;
export async function authorizeCalendar(): Promise<string | null> {
  return null;
}
export async function calendarAccessToken(_googleId: string): Promise<string> {
  throw new Error("calendar-unavailable");
}
export async function forgetCalendarToken() {}
