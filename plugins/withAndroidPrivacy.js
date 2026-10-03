const fs = require("node:fs/promises");
const path = require("node:path");
const {
  AndroidConfig,
  withAndroidManifest,
  withDangerousMod,
} = require("expo/config-plugins");

// Cover credential- and device-protected storage as well as external app files.
const domains = [
  "root",
  "file",
  "database",
  "sharedpref",
  "external",
  "device_root",
  "device_file",
  "device_database",
  "device_sharedpref",
];
const exclusions = domains
  .map((domain) => `    <exclude domain="${domain}" path="." />`)
  .join("\n");

module.exports = function withAndroidPrivacy(config) {
  config = withAndroidManifest(config, (mod) => {
    // Overlay access is only used by the debug developer menu, whose manifest
    // declares it separately. Do not request it in the distributed app.
    mod.modResults.manifest["uses-permission"] = (
      mod.modResults.manifest["uses-permission"] || []
    ).filter(
      (permission) =>
        permission.$["android:name"] !==
        "android.permission.SYSTEM_ALERT_WINDOW",
    );
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(
      mod.modResults,
    );
    app.$["android:allowBackup"] = "false";
    app.$["android:fullBackupContent"] = "@xml/pomodog_backup_rules";
    app.$["android:dataExtractionRules"] = "@xml/pomodog_data_extraction_rules";
    app.$["android:usesCleartextTraffic"] = "false";
    return mod;
  });
  return withDangerousMod(config, [
    "android",
    async (mod) => {
      const target = path.join(
        mod.modRequest.platformProjectRoot,
        "app/src/main/res/xml",
      );
      await fs.mkdir(target, { recursive: true });
      await fs.writeFile(
        path.join(target, "pomodog_backup_rules.xml"),
        `<?xml version="1.0" encoding="utf-8"?>\n<full-backup-content>\n${exclusions}\n</full-backup-content>\n`,
      );
      await fs.writeFile(
        path.join(target, "pomodog_data_extraction_rules.xml"),
        `<?xml version="1.0" encoding="utf-8"?>\n<data-extraction-rules>\n  <cloud-backup>\n${exclusions}\n  </cloud-backup>\n  <device-transfer>\n${exclusions}\n  </device-transfer>\n</data-extraction-rules>\n`,
      );
      return mod;
    },
  ]);
};
