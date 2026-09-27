import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";

import ts from "typescript";

test("local notification imports do not initialize Expo Go remote push modules", () => {
  const source = readFileSync(
    "src/notifications/sessionNotifications.ts",
    "utf8",
  );
  const imports = ts
    .preProcessFile(source)
    .importedFiles.map((file) => file.fileName);
  assert.ok(
    !imports.includes("expo-notifications"),
    "package entrypoint initializes remote push",
  );
  const visited = new Set<string>();
  function visit(specifier: string, directory: string) {
    const stem = resolve(directory, specifier);
    const file = [".android.js", ".native.js", ".js"]
      .map((ext) => stem + ext)
      .find(existsSync);
    assert.ok(file, `Missing notification module: ${stem}`);
    if (visited.has(file)) return;
    visited.add(file);
    assert.doesNotMatch(
      file,
      /TokenEmitter|DevicePushToken|ServerRegistration|warnOfExpoGoPushUsage/,
    );
    for (const imported of ts.preProcessFile(readFileSync(file, "utf8"))
      .importedFiles) {
      if (imported.fileName.startsWith("."))
        visit(imported.fileName, dirname(file));
    }
  }
  const local = imports.filter((name) =>
    name.startsWith("expo-notifications/build/"),
  );
  assert.ok(local.length > 0);
  for (const name of local)
    visit(
      "./" + name.slice("expo-notifications/build/".length),
      resolve("node_modules/expo-notifications/build"),
    );
});
