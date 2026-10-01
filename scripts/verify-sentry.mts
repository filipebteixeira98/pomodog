// Explicit synthetic diagnostic only. Does not change app consent or crash the app.
import { captureException, close, init } from "@sentry/browser";

import { sanitizeErrorEvent } from "#src/monitoring/privacy.ts";
import { sentryDsn } from "#src/monitoring/sentryConfig.ts";

if (!process.argv.includes("--send"))
  throw new Error(
    "Use --send to explicitly send one synthetic verification error",
  );
let accepted = false;
let responseStatus: number | undefined;
init({
  dsn: sentryDsn,
  environment: "integration-test",
  release: "pomodog@0.1.0",
  sendDefaultPii: false,
  defaultIntegrations: false,
  beforeSend(event) {
    const safe = sanitizeErrorEvent(event);
    accepted = safe !== null;
    return safe;
  },
  transport: (options) => ({
    async send(envelope) {
      // SDK envelope format; use its public serializer rather than manual event HTTP payloads.
      const { serializeEnvelope } = await import("@sentry/core");
      const result = await fetch(options.url, {
        method: "POST",
        body: serializeEnvelope(envelope) as BodyInit,
      });
      responseStatus = result.status;
      return { statusCode: result.status };
    },
    async flush() {
      return true;
    },
  }),
});
const eventId = captureException(
  new Error("Pomodog Sentry integration verification"),
  { tags: { operation: "monitoring.verify" } },
);
// Wait for transport, not only event processing. No real account or activity is attached.
await close(10000);
for (let i = 0; responseStatus === undefined && i < 100; i++)
  await new Promise((done) => setTimeout(done, 100));
if (!accepted || responseStatus !== 200)
  throw new Error(
    `Sentry verification failed: status=${responseStatus ?? "missing"}`,
  );
console.log(`Synthetic error accepted by Sentry: ${eventId}`);
