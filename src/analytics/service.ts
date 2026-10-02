import { analyticsAdapter } from "#src/analytics/adapter";
import { createAnalytics } from "#src/analytics/controller";

const analytics = createAnalytics(analyticsAdapter);
export const analyticsSupported = analytics.supported;
export const analyticsEnabled = analytics.enabled;
export const analyticsReady = analytics.ready;
export const subscribeAnalytics = analytics.subscribe;
export const startAnalytics = analytics.restore;
export const setAnalyticsEnabled = analytics.set;
export const trackUsage = analytics.track;
