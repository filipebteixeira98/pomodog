import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { runInNewContext } from "node:vm";

import ts from "typescript";

/** Exercise the installed SDK's actual event validator; only the native bridge is stubbed. */
export function firebaseAnalyticsSdk() {
  const require = createRequire(import.meta.url);
  const source = readFileSync(
    new URL(
      "lib/index.ts",
      pathToFileURL(
        require.resolve("@react-native-firebase/analytics/package.json"),
      ),
    ),
    "utf8",
  );
  const calls: string[] = [];
  const native = {
    logEvent: (name: string) => {
      calls.push(name);
      return Promise.resolve();
    },
  };
  class FirebaseModule {
    native = native;
  }
  const exported: Record<string, any> = {};
  const dependencies: Record<string, unknown> = {
    "react-native": { Platform: { OS: "android" } },
    "@react-native-firebase/app/dist/module/common": {
      isString: (value: unknown) => typeof value === "string",
      isUndefined: (value: unknown) => value === undefined,
      isObject: (value: unknown) =>
        value !== null && typeof value === "object" && !Array.isArray(value),
      isBoolean: (value: unknown) => typeof value === "boolean",
    },
    "@react-native-firebase/app/dist/module/internal": {
      FirebaseModule,
      getOrCreateModularInstance: (Module: new () => unknown) => new Module(),
    },
    "@react-native-firebase/app/dist/module/internal/nativeModule": {
      setReactNativeModule: () => {},
    },
    "./types/internal": {},
    "./struct": {},
    "./structs": {},
    "./web/RNFBAnalyticsModule": {},
    "./version": { version: "test" },
  };
  const javascript = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  runInNewContext(javascript, {
    exports: exported,
    require: (name: string) => {
      if (!(name in dependencies))
        throw Error(`Unexpected SDK dependency: ${name}`);
      return dependencies[name];
    },
  });
  const analytics = exported.getAnalytics();
  return {
    calls,
    log: (name: string, payload: Record<string, string | number>) =>
      exported.logEvent(analytics, name, payload),
  };
}
