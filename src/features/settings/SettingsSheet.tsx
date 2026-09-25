import { Switch, View } from "react-native";
import {
  breakDurations,
  focusDurations,
  themes,
  type Preferences,
} from "../../domain/preferences";
import { Button } from "../../components/ui/Button";
import { ChoiceGroup } from "../../components/ui/ChoiceGroup";
import { Sheet } from "../../components/ui/Sheet";
import { Text } from "../../components/ui/Text";

type Props = {
  visible: boolean;
  onClose: () => void;
  preferences: Preferences;
  onChange: (patch: Partial<Preferences>) => void;
  busy: boolean;
  systemReducedMotion: boolean;
  accent: string;
};

export function SettingsSheet({
  visible,
  onClose,
  preferences,
  onChange,
  busy,
  systemReducedMotion,
  accent,
}: Props) {
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      reducedMotion={preferences.reduceMotion || systemReducedMotion}
    >
      <View>
        <Text variant="heading">Do seu jeito.</Text>
        <Text>Pequenos ajustes para se sentir em casa.</Text>
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
      <Text variant="caption">
        O timer se atualiza ao voltar ao aplicativo. Esta versão ainda não envia
        alertas com a tela bloqueada e não reproduz música.
      </Text>
      <Button accent={accent} onPress={onClose}>
        Pronto, vamos lá
      </Button>
    </Sheet>
  );
}
