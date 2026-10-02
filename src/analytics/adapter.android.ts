import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants, { ExecutionEnvironment } from "expo-constants";

import type { AnalyticsAdapter } from "#src/analytics/controller";

const key = "pomodog.analytics-consent.v1";
const supported =
  Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;

// Lazy loading keeps Expo Go from evaluating modules that require a native build.
function sdk() {
  return require("@react-native-firebase/analytics") as typeof import("@react-native-firebase/analytics");
}

export const analyticsAdapter: AnalyticsAdapter = {
  supported,
  read: () => AsyncStorage.getItem(key),
  write: (value) => AsyncStorage.setItem(key, value),
  async configure(enabled) {
    if (!supported) return;
    const api = sdk();
    const analytics = api.getAnalytics();
    if (!enabled) await api.setAnalyticsCollectionEnabled(analytics, false);
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
