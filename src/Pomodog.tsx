import { useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { usePomodoro } from "./hooks/usePomodoro";
import { useReducedMotion } from "./hooks/useReducedMotion";
import { themes } from "./domain/preferences";
import { AppHeader } from "./components/AppHeader";
import { BottomNavigation, type Tab } from "./components/BottomNavigation";
import { ResetConfirmation } from "./components/ResetConfirmation";
import { Text } from "./components/ui/Text";
import { FocusScreen } from "./features/focus/FocusScreen";
import { ProgressScreen } from "./features/progress/ProgressScreen";
import { SettingsSheet } from "./features/settings/SettingsSheet";
import { Onboarding } from "./features/onboarding/Onboarding";

export function Pomodog() {
  const model = usePomodoro();
  const systemReducedMotion = useReducedMotion();
  const [tab, setTab] = useState<Tab>("focus");
  const [settings, setSettings] = useState(false);
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
        aria-hidden={showOnboarding || settings || confirmReset}
        accessibilityElementsHidden={showOnboarding || settings || confirmReset}
        importantForAccessibility={
          showOnboarding || settings || confirmReset
            ? "no-hide-descendants"
            : "auto"
        }
      >
        <AppHeader
          accent={accent}
          disabled={!model.ready}
          onSettings={() => setSettings(true)}
        />
        <ScrollView
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
          ) : (
            <ProgressScreen
              sessions={model.timer.sessions}
              accent={accent}
              onFocus={() => setTab("focus")}
            />
          )}
        </ScrollView>
        <BottomNavigation value={tab} onChange={setTab} accent={accent} />
      </View>
      <SettingsSheet
        visible={settings}
        onClose={() => setSettings(false)}
        preferences={model.preferences}
        onChange={model.updatePreferences}
        busy={model.busy}
        systemReducedMotion={systemReducedMotion}
        accent={accent}
        onReplayOnboarding={() => {
          setSettings(false);
          setReplayOnboarding(true);
        }}
      />
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
