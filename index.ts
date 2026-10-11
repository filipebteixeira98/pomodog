import { AppRegistry, Platform } from "react-native";
import { registerRootComponent } from "expo";

import App from "#app";
import { startAnalytics } from "#src/analytics/service";
import { reportError, startMonitoring } from "#src/monitoring/sentry";
import { sessionControls } from "#src/notifications/controlRuntime";

void startMonitoring();
void startAnalytics();

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

if (Platform.OS === "android") {
  AppRegistry.registerHeadlessTask(
    "PomodogSessionControl",
    () => async (data: unknown) => {
      try {
        await sessionControls.run(data);
      } catch (error) {
        reportError(error, "notifications.sync");
      }
    },
  );
}
