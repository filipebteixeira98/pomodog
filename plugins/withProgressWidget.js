const fs = require("node:fs/promises");
const path = require("node:path");
const {
  withAndroidManifest,
  withDangerousMod,
  withMainApplication,
} = require("expo/config-plugins");

module.exports = function withProgressWidget(config) {
  config = withMainApplication(config, (mod) => {
    const registration = "add(PomodogProgressPackage())";
    const anchor = "PackageList(this).packages.apply {";
    if (!mod.modResults.contents.includes(registration)) {
      if (!mod.modResults.contents.includes(anchor))
        throw new Error("Widget: unsupported MainApplication registration");
      mod.modResults.contents = mod.modResults.contents.replace(
        anchor,
        `${anchor}\n          ${registration}`,
      );
    }
    return mod;
  });
  config = withAndroidManifest(config, (mod) => {
    const app = mod.modResults.manifest.application[0];
    const name = ".PomodogProgressWidget";
    app.receiver = (app.receiver || []).filter(
      (entry) => entry.$["android:name"] !== name,
    );
    app.receiver.push({
      $: {
        "android:name": name,
        "android:exported": "false",
        "android:label": "@string/widget_name",
      },
      "intent-filter": [
        {
          action: [
            "android.appwidget.action.APPWIDGET_UPDATE",
            "android.intent.action.TIME_SET",
            "android.intent.action.TIMEZONE_CHANGED",
          ].map((action) => ({ $: { "android:name": action } })),
        },
      ],
      "meta-data": [
        {
          $: {
            "android:name": "android.appwidget.provider",
            "android:resource": "@xml/pomodog_progress_widget_info",
          },
        },
      ],
    });
    return mod;
  });
  return withDangerousMod(config, [
    "android",
    async (mod) => {
      const source = path.join(__dirname, "progress-widget");
      const root = path.join(mod.modRequest.platformProjectRoot, "app/src");
      const packagePath = mod.android.package.split(".");
      for (const [directory, files] of [
        [
          "main",
          [
            "PomodogProgressWidget.kt",
            "PomodogProgressPackage.kt",
            "WidgetProgress.kt",
          ],
        ],
        ["test", ["WidgetProgressTest.kt"]],
      ]) {
        const target = path.join(root, directory, "java", ...packagePath);
        await fs.mkdir(target, { recursive: true });
        for (const file of files) {
          const contents = await fs.readFile(path.join(source, file), "utf8");
          await fs.writeFile(
            path.join(target, file),
            contents.replaceAll("__PACKAGE__", mod.android.package),
          );
        }
      }
      await fs.cp(path.join(source, "res"), path.join(root, "main/res"), {
        recursive: true,
      });
      return mod;
    },
  ]);
};
