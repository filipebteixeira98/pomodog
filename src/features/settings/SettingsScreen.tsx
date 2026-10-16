import { Switch, View } from "react-native";
import Timer from "lucide-react-native/icons/timer";

import { AnalyticsSettings } from "#src/analytics/AnalyticsSettings";
import { CalendarSettings } from "#src/calendar/CalendarSettings";
import type { CalendarSnapshot } from "#src/calendar/integration";
import { Card } from "#src/components/ui/Card";
import { ChoiceGroup } from "#src/components/ui/ChoiceGroup";
import { Text } from "#src/components/ui/Text";
import {
  breakDurations,
  focusDurations,
  themes,
  type Preferences,
} from "#src/domain/preferences";
import { FeedbackCard } from "#src/features/feedback/FeedbackCard";
import { TourReplayCard } from "#src/features/tour/TourReplayCard";
import { ReportingSettings } from "#src/monitoring/ReportingSettings";
import { countdownSupported } from "#src/notifications/countdown";

type Props = {
  preferences: Preferences;
  onChange: (patch: Partial<Preferences>) => void;
  busy: boolean;
  systemReducedMotion: boolean;
  accent: string;
  onReplayTour: () => void;
  onFeedback: () => void;
  notificationNotice: string;
  notificationBusy: boolean;
  notificationsSupported: boolean;
  onNotificationsChange: (enabled: boolean) => void;
  calendarState: CalendarSnapshot;
};

export function SettingsScreen({
  preferences,
  onChange,
  busy,
  systemReducedMotion,
  accent,
  onReplayTour,
  onFeedback,
  notificationNotice,
  notificationBusy,
  notificationsSupported,
  onNotificationsChange,
  calendarState,
}: Props) {
  return (
    <>
      <Card className="gap-5">
        <View className="gap-3">
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-soft">
              <Timer size={23} color={accent} />
            </View>
            <Text variant="eyebrow">PREFERÊNCIAS</Text>
          </View>
          <Text variant="heading">No seu ritmo.</Text>
        </View>
        <View className="gap-2">
          <Text variant="label">Tempo de foco</Text>
          <ChoiceGroup
            accent={accent}
            value={preferences.focus}
            disabled={busy}
            onChange={(focus) => onChange({ focus })}
            options={focusDurations.map((value) => ({
              value,
              label: `${value} min`,
              accessibilityLabel: `${value} minutos de foco`,
            }))}
          />
        </View>
        <View className="gap-2">
          <Text variant="label">Tempo de descanso</Text>
          <ChoiceGroup
            accent={accent}
            value={preferences.rest}
            disabled={busy}
            onChange={(rest) => onChange({ rest })}
            options={breakDurations.map((value) => ({
              value,
              label: `${value} min`,
              accessibilityLabel: `${value} minutos de descanso`,
            }))}
          />
          {busy && (
            <Text variant="caption">
              Finalize ou reinicie a sessão para ajustar os tempos.
            </Text>
          )}
        </View>
        <View className="gap-2">
          <Text variant="label">Sua cor, a coleira dele</Text>
          <ChoiceGroup
            accent={accent}
            value={preferences.theme}
            onChange={(theme) => onChange({ theme })}
            options={themes.map((theme, value) => ({
              value,
              label: theme.name,
              color: theme.color,
            }))}
          />
        </View>
        <View className="flex-row items-center gap-3">
          <View className="flex-1">
            <Text variant="label">Menos movimento</Text>
            <Text variant="caption">
              {systemReducedMotion
                ? "Ativado também pelo seu dispositivo."
                : "Deixe o cachorro e as transições sem animação."}
            </Text>
          </View>
          <Switch
            accessibilityLabel="Reduzir animações"
            value={preferences.reduceMotion || systemReducedMotion}
            disabled={systemReducedMotion}
            onValueChange={(reduceMotion) => onChange({ reduceMotion })}
            trackColor={{ true: accent }}
          />
        </View>
        {notificationsSupported && (
          <View className="gap-2">
            <View className="flex-row items-center gap-3">
              <View className="flex-1">
                <Text variant="label">Notificações da sessão</Text>
                <Text variant="caption">
                  {countdownSupported
                    ? "Acompanhe o tempo e receba um aviso ao terminar."
                    : "Receba um aviso ao concluir foco ou descanso."}
                </Text>
              </View>
              <Switch
                accessibilityLabel="Notificações da sessão"
                value={preferences.sessionNotifications}
                disabled={notificationBusy}
                onValueChange={onNotificationsChange}
                trackColor={{ true: accent }}
              />
            </View>
            {notificationNotice ? (
              <Text
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
                variant="caption"
              >
                {notificationNotice}
              </Text>
            ) : null}
          </View>
        )}
      </Card>
      <CalendarSettings
        state={calendarState}
        accent={accent}
        reducedMotion={preferences.reduceMotion || systemReducedMotion}
      />
      <ReportingSettings accent={accent} />
      <AnalyticsSettings accent={accent} />
      <TourReplayCard accent={accent} onReplay={onReplayTour} />
      <FeedbackCard accent={accent} onOpen={onFeedback} />
    </>
  );
}
