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
    const names = [
      ".PomodogCountdownExpiryReceiver",
      ".PomodogSessionControlReceiver",
    ];
    app.receiver = (app.receiver || []).filter(
      (entry) => !names.includes(entry.$["android:name"]),
    );
    for (const name of names)
      app.receiver.push({
        $: { "android:name": name, "android:exported": "false" },
      });
    const service = ".PomodogSessionControlService";
    app.service = (app.service || []).filter(
      (entry) => entry.$["android:name"] !== service,
    );
    app.service.push({
      $: { "android:name": service, "android:exported": "false" },
    });
    const permissions = (mod.modResults.manifest["uses-permission"] ??= []);
    if (
      !permissions.some(
        (entry) => entry.$["android:name"] === "android.permission.WAKE_LOCK",
      )
    ) {
      permissions.push({
        $: { "android:name": "android.permission.WAKE_LOCK" },
      });
    }
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
      for (const file of [
        "PomodogCountdown.kt",
        "PomodogSessionControlService.kt",
      ]) {
        const source = await fs.readFile(
          path.join(__dirname, "session-countdown", file),
          "utf8",
        );
        await fs.writeFile(
          path.join(target, file),
          source.replaceAll("__PACKAGE__", mod.android.package),
        );
      }
      const drawable = path.join(root, "res/drawable");
      await fs.mkdir(drawable, { recursive: true });
      for (const file of [
        "pomodog_timer_notification.xml",
        "pomodog_pause_notification.xml",
        "pomodog_resume_notification.xml",
      ]) {
        await fs.copyFile(
          path.join(__dirname, "session-countdown", file),
          path.join(drawable, file),
        );
      }
      return mod;
    },
  ]);
};
