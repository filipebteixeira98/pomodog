import { useState } from "react";
import { ScrollView, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppHeader } from "#src/components/AppHeader";
import { BottomNavigation, type Tab } from "#src/components/BottomNavigation";
import { ResetConfirmation } from "#src/components/ResetConfirmation";
import { Text } from "#src/components/ui/Text";
import { localSession, type CustomerSession } from "#src/domain/customer";
import { serializeExport } from "#src/domain/exportData";
import { themes } from "#src/domain/preferences";
import { FocusScreen } from "#src/features/focus/FocusScreen";
import { Onboarding } from "#src/features/onboarding/Onboarding";
import { ProgressScreen } from "#src/features/progress/ProgressScreen";
import { EraseDataConfirmation } from "#src/features/settings/EraseDataConfirmation";
import { LocalDataCard } from "#src/features/settings/LocalDataCard";
import { SettingsScreen } from "#src/features/settings/SettingsScreen";
import { usePomodoro } from "#src/hooks/usePomodoro";
import { useReducedMotion } from "#src/hooks/useReducedMotion";
import { exportFile } from "#src/storage/exportFile";

export function Pomodog({
  session = localSession,
}: {
  session?: CustomerSession;
}) {
  const model = usePomodoro();
  const systemReducedMotion = useReducedMotion();
  const [tab, setTab] = useState<Tab>("focus");
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmErase, setConfirmErase] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [dataNotice, setDataNotice] = useState("");
  const [replayOnboarding, setReplayOnboarding] = useState(false);
  const accent = themes[model.preferences.theme].color;
  const reducedMotion = model.preferences.reduceMotion || systemReducedMotion;
  const showOnboarding =
    model.ready &&
    (replayOnboarding ||
      (!model.onboardingComplete && model.timer.status === "idle"));

  async function exportData() {
    setExporting(true);
    setDataNotice("");
    try {
      await exportFile(serializeExport(model.snapshot()));
      setDataNotice(
        "Arquivo preparado. Guarde a cópia no destino que preferir.",
      );
    } catch {
      setDataNotice(
        "Não foi possível exportar. Verifique se o dispositivo permite salvar ou compartilhar arquivos e tente novamente.",
      );
    } finally {
      setExporting(false);
    }
  }
  async function eraseData() {
    setDataNotice("");
    try {
      await model.eraseData();
      setConfirmErase(false);
      setDataNotice("Os dados locais foram apagados.");
    } catch {
      setDataNotice("Não foi possível apagar os dados. Tente novamente.");
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <StatusBar style="dark" />
      <View
        className="w-full max-w-[640px] flex-1 self-center"
        aria-hidden={showOnboarding || confirmReset || confirmErase}
        accessibilityElementsHidden={
          showOnboarding || confirmReset || confirmErase
        }
        importantForAccessibility={
          showOnboarding || confirmReset || confirmErase
            ? "no-hide-descendants"
            : "auto"
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
              {model.storageBlocked
                ? "Não foi possível ler seus dados salvos. Eles foram preservados e o salvamento está suspenso. Você pode continuar temporariamente ou apagar os dados em Ajustes para recomeçar."
                : "Não foi possível salvar seus dados. O progresso pode não permanecer ao fechar o aplicativo."}
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
            >
              <LocalDataCard
                accent={accent}
                onExport={exportData}
                onErase={() => {
                  setDataNotice("");
                  setConfirmErase(true);
                }}
                exporting={exporting}
                exportDisabled={
                  !model.ready || model.storageBlocked || model.isErasing
                }
                eraseDisabled={!model.ready || model.isErasing}
                notice={dataNotice}
              />
            </SettingsScreen>
          )}
        </ScrollView>
        <BottomNavigation value={tab} onChange={setTab} accent={accent} />
      </View>
      <EraseDataConfirmation
        visible={confirmErase}
        onClose={() => setConfirmErase(false)}
        onConfirm={eraseData}
        pending={model.isErasing}
        notice={dataNotice}
        accent={accent}
        reducedMotion={reducedMotion}
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
