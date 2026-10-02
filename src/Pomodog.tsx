import {
  createRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  ActivityIndicator,
  ScrollView,
  useWindowDimensions,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import type { User } from "firebase/auth";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  analyticsEnabled,
  subscribeAnalytics,
  trackUsage,
} from "#src/analytics/service";
import { AppHeader } from "#src/components/AppHeader";
import { BottomNavigation, type Tab } from "#src/components/BottomNavigation";
import { ResetConfirmation } from "#src/components/ResetConfirmation";
import { Text } from "#src/components/ui/Text";
import { localSession, type CustomerSession } from "#src/domain/customer";
import { themes } from "#src/domain/preferences";
import { FocusScreen } from "#src/features/focus/FocusScreen";
import { Onboarding } from "#src/features/onboarding/Onboarding";
import { EraseDataConfirmation } from "#src/features/profile/EraseDataConfirmation";
import { LocalDataCard } from "#src/features/profile/LocalDataCard";
import { ProfileScreen } from "#src/features/profile/ProfileScreen";
import { ProgressScreen } from "#src/features/progress/ProgressScreen";
import { SettingsScreen } from "#src/features/settings/SettingsScreen";
import { GuidedTour, type TourTargets } from "#src/features/tour/GuidedTour";
import { WelcomeScreen } from "#src/features/welcome/WelcomeScreen";
import { usePomodoro } from "#src/hooks/usePomodoro";
import { useReducedMotion } from "#src/hooks/useReducedMotion";

export function Pomodog({
  session = localSession,
  user = null,
  authBusy = false,
  authNotice = "",
  onSignIn = async () => {},
  onSignOut = async () => {},
  onDeleteAccount = async () => false,
  accountLocked = false,
  deletionPending = false,
}: {
  session?: CustomerSession;
  user?: User | null;
  authBusy?: boolean;
  authNotice?: string;
  onSignIn?: () => Promise<void>;
  onSignOut?: () => Promise<void>;
  onDeleteAccount?: () => Promise<boolean>;
  accountLocked?: boolean;
  deletionPending?: boolean;
}) {
  const viewport = useWindowDimensions();
  const model = usePomodoro(user, accountLocked);
  const usageEnabled = useSyncExternalStore(
    subscribeAnalytics,
    analyticsEnabled,
    () => false,
  );
  const host = useRef<View>(null);
  const scroll = useRef<ScrollView>(null);
  const targets = useRef<TourTargets>({
    modes: createRef<View>(),
    action: createRef<View>(),
    navigation: createRef<View>(),
  }).current;
  const [tourStep, setTourStep] = useState<number | null>(null);
  const closeTour = useCallback(() => setTourStep(null), []);
  useEffect(() => {
    if (tourStep === null) return;
    if (tourStep === 1) scroll.current?.scrollToEnd({ animated: false });
    else scroll.current?.scrollTo({ y: 0, animated: false });
  }, [tourStep, viewport.width, viewport.height, viewport.fontScale]);
  const systemReducedMotion = useReducedMotion();
  const [tab, setTab] = useState<Tab>("focus");
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmErase, setConfirmErase] = useState(false);
  const [dataNotice, setDataNotice] = useState("");
  const [entryDismissed, setEntryDismissed] = useState(false);
  const accent = themes[model.preferences.theme].color;
  const reducedMotion = model.preferences.reduceMotion || systemReducedMotion;
  const showOnboarding =
    model.ready &&
    !model.onboardingComplete &&
    model.timer.status === "idle" &&
    !model.storageError;
  const screen = !model.ready
    ? null
    : showOnboarding
      ? !user && !entryDismissed
        ? "welcome"
        : "onboarding"
      : tab;
  useEffect(() => {
    if (screen) trackUsage({ name: "screen_view", screen });
  }, [screen, usageEnabled]);

  function startTour() {
    model.completeOnboarding();
    setTab("focus");
    setTourStep(0);
  }

  async function eraseData() {
    setDataNotice("");
    try {
      await model.eraseData();
      setEntryDismissed(false);
      setConfirmErase(false);
      setDataNotice("Os dados locais foram apagados.");
    } catch {
      setDataNotice("Não foi possível apagar os dados. Tente novamente.");
    }
  }

  if (!model.ready && !accountLocked) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <ActivityIndicator
          accessibilityLabel="Preparando seu cantinho"
          color={accent}
        />
      </View>
    );
  }

  if (showOnboarding && !user && !entryDismissed && !model.storageError) {
    return (
      <WelcomeScreen
        accent={accent}
        reducedMotion={reducedMotion}
        busy={authBusy}
        notice={authNotice}
        onSignIn={onSignIn}
        onContinueLocally={() => setEntryDismissed(true)}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <View ref={host} collapsable={false} className="flex-1">
        <StatusBar style="dark" />
        <View
          className="w-full max-w-[640px] flex-1 self-center"
          pointerEvents={tourStep !== null ? "none" : "auto"}
          aria-hidden={
            showOnboarding || confirmReset || confirmErase || tourStep !== null
          }
          accessibilityElementsHidden={
            showOnboarding || confirmReset || confirmErase || tourStep !== null
          }
          importantForAccessibility={
            showOnboarding || confirmReset || confirmErase || tourStep !== null
              ? "no-hide-descendants"
              : "auto"
          }
        >
          <AppHeader accent={accent} />
          <ScrollView
            ref={scroll}
            scrollEnabled={tourStep === null}
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
                  ? "Não foi possível ler seus dados salvos. Eles foram preservados e o salvamento está suspenso. Você pode continuar temporariamente ou apagar os dados em Perfil para recomeçar."
                  : "Não foi possível salvar seus dados. O progresso pode não permanecer ao fechar o aplicativo."}
              </Text>
            )}
            {tab === "focus" ? (
              <FocusScreen
                tourTargets={targets}
                timer={model.timer}
                accent={accent}
                reducedMotion={
                  reducedMotion || showOnboarding || tourStep !== null
                }
                ready={model.ready}
                onConfigure={model.configure}
                onToggle={model.toggle}
                onFeed={model.feedPet}
                onReset={() => setConfirmReset(true)}
              />
            ) : tab === "progress" ? (
              <ProgressScreen
                sessions={model.timer.sessions}
                accent={accent}
                onFocus={() => setTab("focus")}
              />
            ) : tab === "settings" ? (
              <SettingsScreen
                preferences={model.preferences}
                onChange={model.updatePreferences}
                busy={model.busy || !model.ready}
                systemReducedMotion={systemReducedMotion}
                accent={accent}
                onReplayTour={startTour}
                notificationNotice={model.notificationNotice}
                notificationBusy={
                  model.notificationBusy || !model.ready || model.isErasing
                }
                notificationsSupported={model.notificationsSupported}
                onNotificationsChange={model.setSessionNotifications}
              />
            ) : (
              <ProfileScreen
                session={session}
                accent={accent}
                authBusy={authBusy}
                authNotice={
                  authNotice ||
                  (model.syncError
                    ? "Seu progresso está salvo neste dispositivo, mas ainda não foi sincronizado."
                    : "")
                }
                onSignIn={onSignIn}
                onSignOut={onSignOut}
                onDeleteAccount={onDeleteAccount}
                deletionPending={deletionPending}
                reducedMotion={reducedMotion}
              >
                {session.status === "guest" && (
                  <LocalDataCard
                    accent={accent}
                    onErase={() => {
                      setDataNotice("");
                      setConfirmErase(true);
                    }}
                    eraseDisabled={!model.ready || model.isErasing}
                    notice={dataNotice}
                  />
                )}
              </ProfileScreen>
            )}
          </ScrollView>
          <View ref={targets.navigation} collapsable={false}>
            <BottomNavigation value={tab} onChange={setTab} accent={accent} />
          </View>
        </View>
        {tourStep !== null && (
          <GuidedTour
            index={tourStep}
            targets={targets}
            host={host}
            accent={accent}
            onChange={setTourStep}
            onClose={closeTour}
          />
        )}
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
            authenticated={user !== null}
            onShowTour={startTour}
            accent={accent}
            reducedMotion={reducedMotion}
            onFinish={() => {
              model.completeOnboarding();
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
