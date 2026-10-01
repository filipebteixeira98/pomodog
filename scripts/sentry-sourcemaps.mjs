import { spawnSync } from "node:child_process";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const [action, ...platforms] = process.argv.slice(2);
const selected = platforms.length ? platforms : ["web", "android"];

async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) => {
        const path = join(directory, entry.name);
        return entry.isDirectory() ? files(path) : [path];
      }),
    )
  ).flat();
}

async function check(platform) {
  const directory = join(root, "dist-sentry", platform);
  const artifacts = await files(directory).catch(() => {
    throw new Error(`Export missing: run npm run sentry:export:${platform}`);
  });
  const bundles = artifacts.filter((path) => /\.(js|hbc)$/.test(path));
  if (!bundles.length) throw new Error(`No bundles found for ${platform}`);
  const verified = [];
  for (const bundle of bundles) {
    const map = JSON.parse(
      await readFile(`${bundle}.map`, "utf8").catch(() => {
        throw new Error(`Source map missing for ${bundle}`);
      }),
    );
    const id = map.debugId ?? map.debug_id;
    if (!/^[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(id ?? ""))
      throw new Error(`Source map missing valid debug ID: ${bundle}`);
    if (map.debugId && map.debug_id && map.debugId !== map.debug_id)
      throw new Error(`Source map has inconsistent debug IDs: ${bundle}`);
    const contents = await readFile(bundle);
    if (!contents.includes(Buffer.from(`sentry-dbid-${id}`)))
      throw new Error(
        `Bundle and source map debug IDs do not match: ${bundle}`,
      );
    if (!map.mappings || !Array.isArray(map.sources) || !map.sources.length)
      throw new Error(`Empty source map: ${bundle}`);
    verified.push({ bundle, map });
    console.log(
      `${platform}: ${bundle.slice(directory.length + 1)} — debug ID ${id}`,
    );
  }
  return verified;
}

try {
  if (
    !["check", "upload"].includes(action) ||
    selected.some((platform) => !["web", "android"].includes(platform))
  )
    throw new Error(
      "Usage: npm run sentry:check|sentry:upload -- [web|android]",
    );
  const groups = await Promise.all([...new Set(selected)].map(check));
  if (action === "upload") {
    // Read only the build-token file; never load it into Metro or the runtime bundle.
    const tokenFile = join(root, ".env.sentry-build-plugin");
    const config = await readFile(tokenFile, "utf8").catch((error) => {
      if (error.code === "ENOENT") return "";
      throw error;
    });
    const token =
      process.env.SENTRY_AUTH_TOKEN || parseEnv(config).SENTRY_AUTH_TOKEN;
    if (!token?.trim())
      throw new Error(
        "SENTRY_AUTH_TOKEN missing. Set a build secret or use the ignored .env.sentry-build-plugin file. Never send the token in chat.",
      );
    const manifest = JSON.parse(await readFile(join(root, "app.json"), "utf8"));
    const plugin = manifest.expo.plugins.find(
      (item) => Array.isArray(item) && item[0] === "@sentry/react-native/expo",
    )?.[1];
    if (!plugin?.organization || !plugin?.project || !plugin?.url)
      throw new Error("Sentry Expo plugin configuration missing");
    const cli = require.resolve("@sentry/cli/bin/sentry-cli");
    for (const { bundle, map } of groups.flat()) {
      // The SDK uploader normalizes Expo's debugId to the field expected by the CLI.
      await writeFile(
        `${bundle}.map`,
        JSON.stringify({ ...map, debug_id: map.debugId ?? map.debug_id }),
      );
      const result = spawnSync(
        process.execPath,
        [
          cli,
          "sourcemaps",
          "upload",
          "--validate",
          "--wait",
          ...(bundle.endsWith(".hbc") ? ["--debug-id-reference"] : []),
          bundle,
          `${bundle}.map`,
        ],
        {
          cwd: root,
          stdio: "inherit",
          env: {
            ...process.env,
            SENTRY_AUTH_TOKEN: token,
            SENTRY_ORG: plugin.organization,
            SENTRY_PROJECT: plugin.project,
            SENTRY_URL: plugin.url.replace(/\/+$/, ""),
          },
        },
      );
      if (result.error || result.status !== 0)
        throw new Error("Sentry source-map upload failed");
    }
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
