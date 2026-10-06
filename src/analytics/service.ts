import { analyticsAdapter } from "#src/analytics/adapter";
import { createAnalytics } from "#src/analytics/controller";
import type { ConsentSource } from "#src/privacy/consentJournal";
import { recordedConsent } from "#src/privacy/consentService";

const analytics = createAnalytics(analyticsAdapter);
export const analyticsSupported = analytics.supported;
export const analyticsEnabled = analytics.enabled;
export const analyticsReady = analytics.ready;
export const subscribeAnalytics = analytics.subscribe;
export const startAnalytics = analytics.restore;
export const setAnalyticsEnabled = analytics.supported
  ? recordedConsent("usage", analytics.set)
  : async (_value: boolean, _source?: ConsentSource) => {};
export const trackUsage = analytics.track;
