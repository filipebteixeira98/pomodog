import { useState } from "react";
import { ScrollView, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppHeader } from "./components/AppHeader";
import { BottomNavigation, type Tab } from "./components/BottomNavigation";
import { ResetConfirmation } from "./components/ResetConfirmation";
import { Text } from "./components/ui/Text";
import { localSession, type CustomerSession } from "./domain/customer";
import { themes } from "./domain/preferences";
import { FocusScreen } from "./features/focus/FocusScreen";
import { Onboarding } from "./features/onboarding/Onboarding";
import { ProgressScreen } from "./features/progress/ProgressScreen";
import { SettingsScreen } from "./features/settings/SettingsScreen";
import { usePomodoro } from "./hooks/usePomodoro";
import { useReducedMotion } from "./hooks/useReducedMotion";

export function Pomodog({
  session = localSession,
}: {
  session?: CustomerSession;
}) {
  const model = usePomodoro();
  const systemReducedMotion = useReducedMotion();
  const [tab, setTab] = useState<Tab>("focus");
  const [confirmReset, setConfirmReset] = useState(false);
  const [replayOnboarding, setReplayOnboarding] = useState(false);
  const accent = themes[model.preferences.theme].color;
  const reducedMotion = model.preferences.reduceMotion || systemReducedMotion;
  const showOnboarding =
    model.ready &&
    (replayOnboarding ||
      (!model.onboardingComplete && model.timer.status === "idle"));

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <StatusBar style="dark" />
      <View
        className="w-full max-w-[640px] flex-1 self-center"
        aria-hidden={showOnboarding || confirmReset}
        accessibilityElementsHidden={showOnboarding || confirmReset}
        importantForAccessibility={
          showOnboarding || confirmReset ? "no-hide-descendants" : "auto"
        }
      >
        <AppHeader accent={accent} />
        <ScrollView
          key={tab}
          contentContainerClassName="gap-[18px] px-[22px] pb-6 pt-3"
          showsVerticalScrollIndicator={false}
        >
          {model.storageError && (
            <Text
              accessibilityRole="alert"
              className="rounded-xl bg-[#F9E8CB] p-3 text-[#785621]"
            >
              Não foi possível recuperar ou salvar seus dados. O progresso pode
              não permanecer ao fechar o aplicativo.
            </Text>
          )}
          {tab === "focus" ? (
            <FocusScreen
              timer={model.timer}
              accent={accent}
              reducedMotion={reducedMotion}
              ready={model.ready}
              onConfigure={model.configure}
              onToggle={model.toggle}
              onReset={() => setConfirmReset(true)}
            />
          ) : tab === "progress" ? (
            <ProgressScreen
              sessions={model.timer.sessions}
              accent={accent}
              onFocus={() => setTab("focus")}
            />
          ) : (
            <SettingsScreen
              session={session}
              preferences={model.preferences}
              onChange={model.updatePreferences}
              busy={model.busy || !model.ready}
              systemReducedMotion={systemReducedMotion}
              accent={accent}
              onReplayOnboarding={() => setReplayOnboarding(true)}
            />
          )}
        </ScrollView>
        <BottomNavigation value={tab} onChange={setTab} accent={accent} />
      </View>
      <ResetConfirmation
        visible={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => {
          model.reset();
          setConfirmReset(false);
        }}
        accent={accent}
        reducedMotion={reducedMotion}
      />
      {showOnboarding && (
        <Onboarding
          accent={accent}
          reducedMotion={reducedMotion}
          onFinish={() => {
            model.completeOnboarding();
            setReplayOnboarding(false);
          }}
        />
      )}
    </SafeAreaView>
  );
}
