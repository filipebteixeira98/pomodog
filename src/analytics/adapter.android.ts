import { NativeModules } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants, { ExecutionEnvironment } from "expo-constants";

import type { AnalyticsAdapter } from "#src/analytics/controller";
import { consentJournal } from "#src/privacy/consentService";

const key = "pomodog.analytics-consent.v1";
const supported =
  Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;
const nativeConsent = NativeModules.PomodogReporting as
  | {
      readUsageConsent: () => Promise<string>;
      writeUsageConsent: (value: string) => Promise<void>;
    }
  | undefined;

// Lazy loading keeps Expo Go from evaluating modules that require a native build.
function sdk() {
  return require("@react-native-firebase/analytics") as typeof import("@react-native-firebase/analytics");
}

export const analyticsAdapter: AnalyticsAdapter = {
  supported,
  diagnose(stage, event) {
    if (__DEV__)
      console.warn(
        `[Pomodog analytics] ${stage} failed${event ? `: ${event}` : ""}`,
      );
  },
  read: async () => {
    if (!(await consentJournal.granted("usage"))) return null;
    return nativeConsent ? nativeConsent.readUsageConsent() : null;
  },
  async write(value) {
    if (!nativeConsent?.writeUsageConsent)
      throw new Error("usage-consent-rebuild-required");
    await nativeConsent.writeUsageConsent(value);
    // Remove the old boolean. Never migrate it into consent evidence.
    await AsyncStorage.removeItem(key);
  },
  async configure(enabled) {
    if (!supported) return;
    const api = sdk();
    const analytics = api.getAnalytics();
    if (!enabled) {
      await api.setAnalyticsCollectionEnabled(analytics, false);
      if (nativeConsent?.writeUsageConsent)
        await nativeConsent.writeUsageConsent("disabled");
    }
    await api.setConsent(analytics, {
      analytics_storage: enabled,
      ad_storage: false,
      ad_user_data: false,
      ad_personalization: false,
    });
    await api.setUserId(analytics, null);
    if (enabled) await api.setAnalyticsCollectionEnabled(analytics, true);
    else await api.resetAnalyticsData(analytics);
  },
  log(name, payload) {
    const api = sdk();
    return api.logEvent(api.getAnalytics(), name, payload);
  },
};
