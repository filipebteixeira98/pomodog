import assert from "node:assert/strict";
import test from "node:test";

import { createAnalytics } from "#src/analytics/controller.ts";
import { saveCollectionChoice } from "#src/features/privacy/collectionChoice.ts";
import { createReportingConsent } from "#src/monitoring/consent.ts";

test("privacy selection updates both existing settings stores and survives restoration", async () => {
  let diagnostic: string | null = null;
  let usage: string | null = null;
  const reportingAdapter = {
    read: async () => diagnostic,
    write: async (value: string) => {
      diagnostic = value;
    },
    initialize: () => {},
  };
  const usageAdapter = {
    supported: true,
    read: async () => usage,
    write: async (value: string) => {
      usage = value;
    },
    configure: async () => {},
    log: () => {},
  };
  const reporting = createReportingConsent(reportingAdapter);
  const analytics = createAnalytics(usageAdapter);
  await Promise.all([reporting.restore(), analytics.restore()]);
  const adapter = { reporting: reporting.set, usage: analytics.set };
  assert.equal(reporting.enabled(), false);
  assert.equal(analytics.enabled(), false);
  await saveCollectionChoice(true, adapter);
  assert.equal(reporting.enabled(), true);
  assert.equal(analytics.enabled(), true);
  const restoredReporting = createReportingConsent(reportingAdapter);
  const restoredUsage = createAnalytics(usageAdapter);
  await Promise.all([restoredReporting.restore(), restoredUsage.restore()]);
  assert.equal(restoredReporting.enabled(), true);
  assert.equal(restoredUsage.enabled(), true);
  await saveCollectionChoice(false, adapter);
  assert.equal(reporting.enabled(), false);
  assert.equal(analytics.enabled(), false);
  assert.equal(diagnostic, "disabled");
  assert.equal(usage, "disabled");
  // Manual settings remain independent after the combined first-use decision.
  await reporting.set(true);
  assert.equal(reporting.enabled(), true);
  assert.equal(analytics.enabled(), false);
});
test("partial grant failure revokes both collectors and does not finish privacy selection", async () => {
  const calls: string[] = [];
  await assert.rejects(
    saveCollectionChoice(true, {
      reporting: async (enabled) => {
        calls.push(`reporting:${enabled}`);
      },
      usage: async (enabled) => {
        calls.push(`usage:${enabled}`);
        if (enabled) throw Error("native unavailable");
      },
    }),
  );
  assert.deepEqual(calls, [
    "reporting:true",
    "usage:true",
    "reporting:false",
    "usage:false",
  ]);
});
test("refusal attempts both revocations even when one fails", async () => {
  const calls: string[] = [];
  await assert.rejects(
    saveCollectionChoice(false, {
      reporting: async (enabled) => {
        calls.push(`reporting:${enabled}`);
        throw Error("storage unavailable");
      },
      usage: async (enabled) => {
        calls.push(`usage:${enabled}`);
      },
    }),
  );
  assert.deepEqual(calls, ["reporting:false", "usage:false"]);
});
