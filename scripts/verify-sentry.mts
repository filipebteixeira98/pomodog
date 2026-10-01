// Explicit synthetic diagnostic only. Does not change app consent or crash the app.
import { readdir, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { basename, join } from "node:path";

import { captureEvent, captureException, close, init } from "@sentry/browser";
import type { ErrorEvent } from "@sentry/core";

import { sanitizeErrorEvent } from "#src/monitoring/privacy.ts";
import { sentryDsn } from "#src/monitoring/sentryConfig.ts";

if (!process.argv.includes("--send"))
  throw new Error(
    "Use --send to explicitly send one synthetic verification error",
  );
const { SourceMapConsumer } = createRequire(import.meta.url)("source-map");

const mapOption = process.argv.indexOf("--source-maps");
const platform = mapOption >= 0 ? process.argv[mapOption + 1] : undefined;
let mappedEvent: ErrorEvent | undefined;
if (mapOption >= 0) {
  if (platform !== "web" && platform !== "android")
    throw new Error("Choose --source-maps web|android");
  const directory = join(
    "dist-sentry",
    platform,
    "_expo",
    "static",
    "js",
    platform,
  );
  const mapName = (await readdir(directory)).find(
    (name) => name.startsWith("index-") && name.endsWith(".map"),
  );
  if (!mapName) throw new Error("Export source maps first");
  const map = JSON.parse(await readFile(join(directory, mapName), "utf8"));
  const source = map.sources.find((value: string) =>
    value.endsWith("/App.tsx"),
  );
  const content = map.sourcesContent[map.sources.indexOf(source)];
  const line =
    content
      ?.split("\n")
      .findIndex((value: string) => value.startsWith("function App()")) + 1;
  if (!line) throw new Error("Could not locate verification source");
  const consumer = new SourceMapConsumer(map);
  const position = consumer.generatedPositionFor({
    source,
    line,
    column: 0,
    bias: SourceMapConsumer.LEAST_UPPER_BOUND,
  });
  if (position.line === null || position.column === null)
    throw new Error("Source mapping failed");
  const original = consumer.originalPositionFor(position);
  if (original.source !== source || original.line !== line)
    throw new Error("Source mapping mismatch");
  const filename = basename(mapName.slice(0, -4));
  mappedEvent = {
    type: undefined,
    platform: "javascript",
    tags: { operation: "monitoring.verify" },
    debug_meta: {
      images: [
        {
          type: "sourcemap",
          code_file: filename,
          debug_id: map.debugId ?? map.debug_id,
        },
      ],
    },
    exception: {
      values: [
        {
          type: "PomodogError",
          value: "Synthetic source-map verification",
          stacktrace: {
            frames: [
              {
                filename,
                lineno: position.line,
                colno: position.column + 1,
                in_app: true,
              },
            ],
          },
        },
      ],
    },
  };
  console.log(`Verifying ${platform} mapping to ${source}:${line}`);
}
let accepted = false;
let responseStatus: number | undefined;
init({
  dsn: sentryDsn,
  environment: platform
    ? `source-map-verification-${platform}`
    : "integration-test",
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
const eventId = mappedEvent
  ? captureEvent(mappedEvent)
  : captureException(new Error("Pomodog Sentry integration verification"), {
      tags: { operation: "monitoring.verify" },
    });
// Wait for transport, not only event processing. No real account or activity is attached.
await close(10000);
for (let i = 0; responseStatus === undefined && i < 100; i++)
  await new Promise((done) => setTimeout(done, 100));
if (!accepted || responseStatus !== 200)
  throw new Error(
    `Sentry verification failed: status=${responseStatus ?? "missing"}`,
  );
console.log(`Synthetic error accepted by Sentry: ${eventId}`);
