const { getSentryExpoConfig } = require("@sentry/react-native/metro");
const { withNativeWind } = require("nativewind/metro");

module.exports = withNativeWind(getSentryExpoConfig(__dirname), {
  input: "./global.css",
});
