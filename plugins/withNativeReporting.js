const fs = require("node:fs/promises");
const path = require("node:path");
const notice = require("../src/privacy/notice.json");
const firebaseBom = require("@react-native-firebase/app/package.json")
  .sdkVersions.android.firebase;
const {
  withAndroidManifest,
  withMainApplication,
  withDangerousMod,
  withAppBuildGradle,
} = require("expo/config-plugins");

module.exports = function withNativeReporting(config) {
  config = withAppBuildGradle(config, (mod) => {
    const source = mod.modResults.contents
      .replace(
        /\n\/\/ Native diagnostic privacy regression tests\ndependencies \{[^\n]*\}\n/g,
        "",
      )
      .replace(
        /\/\/ Pomodog native consent dependencies[\s\S]*?\/\/ End Pomodog native consent dependencies\s*/g,
        "",
      );
    // RN Firebase's Analytics dependency is private to its module. The startup
    // provider needs compile access to the same SDK; Gradle packages one version.
    mod.modResults.contents =
      source +
      `\n// Pomodog native consent dependencies\ndependencies {\n  implementation platform("com.google.firebase:firebase-bom:${firebaseBom}")\n  implementation "com.google.firebase:firebase-analytics"\n  testImplementation "junit:junit:4.13.2"\n}\n// End Pomodog native consent dependencies\n`;
    return mod;
  });
  config = withAndroidManifest(config, (mod) => {
    const app = mod.modResults.manifest.application[0];
    app.provider = (app.provider || []).filter(
      (entry) => entry.$["android:name"] !== ".PomodogConsentProvider",
    );
    app.provider.push({
      $: {
        "android:name": ".PomodogConsentProvider",
        "android:authorities": "${applicationId}.pomodog-consent",
        "android:exported": "false",
        "android:initOrder": "1000",
      },
    });
    app["meta-data"] = (app["meta-data"] || []).filter(
      (entry) => entry.$["android:name"] !== "io.sentry.auto-init",
    );
    app["meta-data"].push({
      $: { "android:name": "io.sentry.auto-init", "android:value": "false" },
    });
    return mod;
  });
  config = withMainApplication(config, (mod) => {
    let source = mod.modResults.contents;
    if (!source.includes("add(PomodogReportingPackage())")) {
      if (!source.includes("PackageList(this).packages.apply {"))
        throw new Error(
          "Native reporting: unsupported MainApplication package registration",
        );
      source = source.replace(
        "PackageList(this).packages.apply {",
        "PackageList(this).packages.apply {\n          add(PomodogReportingPackage())",
      );
    }
    if (!source.includes("PomodogNativeReporting.restore(this)")) {
      if (!source.includes("super.onCreate()"))
        throw new Error(
          "Native reporting: unsupported MainApplication startup",
        );
      source = source.replace(
        "super.onCreate()",
        "super.onCreate()\n    PomodogNativeReporting.restore(this)",
      );
    }
    mod.modResults.contents = source;
    return mod;
  });
  return withDangerousMod(config, [
    "android",
    async (mod) => {
      const packageName = mod.android.package;
      const target = path.join(
        mod.modRequest.platformProjectRoot,
        "app/src/main/java",
        ...packageName.split("."),
      );
      await fs.mkdir(target, { recursive: true });
      for (const file of [
        "PomodogNativeReporting.kt",
        "PomodogReportingPackage.kt",
        "PomodogConsentProvider.kt",
      ]) {
        const source = await fs.readFile(
          path.join(__dirname, "native-reporting", file),
          "utf8",
        );
        await fs.writeFile(
          path.join(target, file),
          source
            .replaceAll("__PACKAGE__", packageName)
            .replaceAll(
              "__DSN__",
              "https://c9f80183bc5e1f76fff135e13ca4cd61@o374019.ingest.us.sentry.io/4512176486416384",
            )
            .replaceAll("__VERSION__", mod.version)
            .replaceAll("__CONSENT_VERSION__", notice.version),
        );
      }
      const tests = path.join(
        mod.modRequest.platformProjectRoot,
        "app/src/test/java",
        ...packageName.split("."),
      );
      await fs.mkdir(tests, { recursive: true });
      const testSource = await fs.readFile(
        path.join(__dirname, "native-reporting", "NativeReportingTest.kt"),
        "utf8",
      );
      await fs.writeFile(
        path.join(tests, "NativeReportingTest.kt"),
        testSource
          .replaceAll("__PACKAGE__", packageName)
          .replaceAll("__CONSENT_VERSION__", notice.version),
      );
      return mod;
    },
  ]);
};
