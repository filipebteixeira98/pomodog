import { Switch, View } from "react-native";
import Timer from "lucide-react-native/icons/timer";

import { Button } from "#src/components/ui/Button";
import { Card } from "#src/components/ui/Card";
import { ChoiceGroup } from "#src/components/ui/ChoiceGroup";
import { Text } from "#src/components/ui/Text";
import {
  breakDurations,
  focusDurations,
  themes,
  type Preferences,
} from "#src/domain/preferences";

type Props = {
  preferences: Preferences;
  onChange: (patch: Partial<Preferences>) => void;
  busy: boolean;
  systemReducedMotion: boolean;
  accent: string;
  onReplayOnboarding: () => void;
};

export function SettingsScreen({
  preferences,
  onChange,
  busy,
  systemReducedMotion,
  accent,
  onReplayOnboarding,
}: Props) {
  return (
    <>
      <Card className="gap-5">
        <View className="gap-2">
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-soft">
              <Timer size={23} color={accent} />
            </View>
            <Text variant="label">Tempo de foco</Text>
          </View>
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
        <Text variant="caption">
          O timer se atualiza ao voltar ao aplicativo. Esta versão ainda não
          envia alertas com a tela bloqueada e não reproduz música.
        </Text>
        <Button accent={accent} secondary onPress={onReplayOnboarding}>
          Rever introdução
        </Button>
      </Card>
    </>
  );
}
