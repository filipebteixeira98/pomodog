import "#styles";

import { useCallback, useState } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { Poppins_400Regular } from "@expo-google-fonts/poppins/400Regular";
import { Poppins_500Medium } from "@expo-google-fonts/poppins/500Medium";
import { Poppins_600SemiBold } from "@expo-google-fonts/poppins/600SemiBold";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { Toast } from "#src/components/ui/Toast";
import { useAccount } from "#src/firebase/useAccount";
import { MonitoringBoundary } from "#src/monitoring/MonitoringBoundary";
import { withErrorMonitoring } from "#src/monitoring/sentry";
import { Pomodog } from "#src/Pomodog";

if (Platform.OS !== "web") {
  void SplashScreen.preventAutoHideAsync().catch(() => {});
}

function App() {
  const account = useAccount();
  const [showDeletionToast, setShowDeletionToast] = useState(false);
  const dismissDeletionToast = useCallback(
    () => setShowDeletionToast(false),
    [],
  );
  async function removeAccount() {
    const removed = await account.removeAccount();
    if (removed) setShowDeletionToast(true);
    return removed;
  }
  const [loaded, error] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });
  if ((!loaded && !error) || account.loading)
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <ActivityIndicator
          accessibilityLabel="Preparando seu cantinho"
          color="#4E6B55"
        />
      </View>
    );
  return (
    <SafeAreaProvider
      onLayout={() => {
        if (Platform.OS !== "web") {
          void SplashScreen.hideAsync().catch(() => {});
        }
      }}
    >
      <Pomodog
        key={account.user?.uid ?? "guest"}
        user={account.user}
        session={account.session}
        authBusy={account.busy}
        authNotice={account.notice}
        onSignIn={account.login}
        onSignOut={account.logout}
        onDeleteAccount={removeAccount}
        accountLocked={account.accountLocked}
        deletionPending={account.deletionPending}
      />
      {showDeletionToast && (
        <Toast
          message="Sua conta foi excluída."
          onDismiss={dismissDeletionToast}
        />
      )}
    </SafeAreaProvider>
  );
}

export default withErrorMonitoring(function Root() {
  return (
    <MonitoringBoundary>
      <App />
    </MonitoringBoundary>
  );
});
