const fs = require("node:fs/promises");
const path = require("node:path");
const {
  withAndroidManifest,
  withDangerousMod,
  withMainApplication,
} = require("expo/config-plugins");

module.exports = function withSessionCountdown(config) {
  config = withMainApplication(config, (mod) => {
    const registration = "add(PomodogCountdownPackage())";
    if (!mod.modResults.contents.includes(registration)) {
      const anchor = "PackageList(this).packages.apply {";
      if (!mod.modResults.contents.includes(anchor))
        throw new Error("Countdown: unsupported MainApplication registration");
      mod.modResults.contents = mod.modResults.contents.replace(
        anchor,
        `${anchor}\n          ${registration}`,
      );
    }
    return mod;
  });
  config = withAndroidManifest(config, (mod) => {
    const app = mod.modResults.manifest.application[0];
    // Android 7 needs a private receiver for expiry; Android 8+ uses system timeout.
    const name = ".PomodogCountdownExpiryReceiver";
    app.receiver = (app.receiver || []).filter(
      (entry) => entry.$["android:name"] !== name,
    );
    app.receiver.push({
      $: { "android:name": name, "android:exported": "false" },
    });
    return mod;
  });
  return withDangerousMod(config, [
    "android",
    async (mod) => {
      const root = path.join(
        mod.modRequest.platformProjectRoot,
        "app/src/main",
      );
      const target = path.join(root, "java", ...mod.android.package.split("."));
      await fs.mkdir(target, { recursive: true });
      const source = await fs.readFile(
        path.join(__dirname, "session-countdown", "PomodogCountdown.kt"),
        "utf8",
      );
      await fs.writeFile(
        path.join(target, "PomodogCountdown.kt"),
        source.replaceAll("__PACKAGE__", mod.android.package),
      );
      const drawable = path.join(root, "res/drawable");
      await fs.mkdir(drawable, { recursive: true });
      await fs.copyFile(
        path.join(
          __dirname,
          "session-countdown",
          "pomodog_timer_notification.xml",
        ),
        path.join(drawable, "pomodog_timer_notification.xml"),
      );
      return mod;
    },
  ]);
};
