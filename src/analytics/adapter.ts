import type { AnalyticsAdapter } from "#src/analytics/controller";

// Web/iOS have no Analytics configuration in this Android delivery.
export const analyticsAdapter: AnalyticsAdapter = {
  supported: false,
  read: async () => null,
  write: async () => {},
  configure: async () => {},
  log: () => {},
};
