import { registerRootComponent } from "expo";

import App from "#app";
import { startAnalytics } from "#src/analytics/service";
import { startMonitoring } from "#src/monitoring/sentry";

void startMonitoring();
void startAnalytics();

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
