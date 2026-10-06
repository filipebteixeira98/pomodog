import { NativeModules, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Sentry from "@sentry/react-native";

import { createReportingConsent } from "#src/monitoring/consent";
import {
  operations,
  sanitizeErrorEvent,
  type ErrorOperation,
} from "#src/monitoring/privacy";
import { reportingStorageKey, sentryDsn } from "#src/monitoring/sentryConfig";
import { consentJournal, recordedConsent } from "#src/privacy/consentService";

let initialized = false;

type NativeReporting = {
  readConsent: () => Promise<string>;
  writeConsent: (value: string) => Promise<void>;
};
const nativeReporting: NativeReporting | undefined =
  Platform.OS === "android" ? NativeModules.PomodogReporting : undefined;

function initialize() {
  if (initialized) return;
  Sentry.init({
    dsn: sentryDsn,
    environment: __DEV__ ? "development" : "production",
    release: "pomodog@0.1.0",
    sendDefaultPii: false,
    enableNative: false,
    // Android crashes use a separate native client with its own consent/filter.
    autoInitializeNativeSdk: false,
    enableAutoSessionTracking: false,
    enableAppStartTracking: false,
    enableNativeFramesTracking: false,
    enableStallTracking: false,
    enableUserInteractionTracing: false,
    tracesSampleRate: 0,
    profilesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    enableLogs: false,
    maxBreadcrumbs: 0,
    integrations: (defaults) =>
      defaults.filter((integration) =>
        [
          "ReactNativeErrorHandlers",
          "GlobalHandlers",
          "Dedupe",
          "InboundFilters",
          "LinkedErrors",
          "DebugIds",
        ].includes(integration.name),
      ),
    beforeBreadcrumb: () => null,
    beforeSend: (event) =>
      consent.enabled() ? sanitizeErrorEvent(event) : null,
  });
  initialized = true;
}

const consent = createReportingConsent({
  read: async () => {
    if (!(await consentJournal.granted("diagnostics"))) {
      if (nativeReporting) await nativeReporting.writeConsent("disabled");
      else await AsyncStorage.setItem(reportingStorageKey, "disabled");
      return null;
    }
    return nativeReporting
      ? nativeReporting.readConsent()
      : AsyncStorage.getItem(reportingStorageKey);
  },
  write: (value) =>
    nativeReporting
      ? nativeReporting.writeConsent(value)
      : AsyncStorage.setItem(reportingStorageKey, value),
  initialize,
});
export const startMonitoring = consent.restore;
export const subscribeReporting = consent.subscribe;
export const reportingEnabled = consent.enabled;
export const reportingReady = consent.ready;
export const setReportingEnabled = recordedConsent("diagnostics", consent.set);

export function reportError(error: unknown, operation: ErrorOperation) {
  if (!consent.enabled() || !initialized) return;
  // Report a fixed message; preserve stack locations, never attach the original cause/data.
  const safe = new Error(operations[operation]);
  safe.name = "PomodogError";
  if (error instanceof Error) safe.stack = error.stack;
  Sentry.captureException(safe, { tags: { operation } });
}

export const withErrorMonitoring = Sentry.wrap;
