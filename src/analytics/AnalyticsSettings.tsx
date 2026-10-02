import { useState, useSyncExternalStore } from "react";
import { Switch, View } from "react-native";
import ChartNoAxesColumn from "lucide-react-native/icons/chart-no-axes-column";

import {
  analyticsEnabled,
  analyticsReady,
  analyticsSupported,
  setAnalyticsEnabled,
  subscribeAnalytics,
} from "#src/analytics/service";
import { Card } from "#src/components/ui/Card";
import { Text } from "#src/components/ui/Text";

export function AnalyticsSettings({ accent }: { accent: string }) {
  const enabled = useSyncExternalStore(
    subscribeAnalytics,
    analyticsEnabled,
    () => false,
  );
  const ready = useSyncExternalStore(
    subscribeAnalytics,
    analyticsReady,
    () => false,
  );
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  if (!analyticsSupported) return null;
  async function change(value: boolean) {
    if (busy) return;
    setBusy(true);
    setNotice("");
    try {
      await setAnalyticsEnabled(value);
    } catch {
      setNotice("Não foi possível salvar essa escolha. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Card className="gap-3">
      <View className="flex-row items-center gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-soft">
          <ChartNoAxesColumn size={23} color={accent} />
        </View>
        <Text variant="eyebrow">USO OPCIONAL</Text>
      </View>
      <View className="flex-row items-center gap-3">
        <Text variant="label" className="flex-1">
          Compartilhar como uso o app
        </Text>
        <Switch
          accessibilityLabel="Permitir o envio de informações sobre o uso do aplicativo"
          value={enabled}
          disabled={busy || !ready}
          onValueChange={(value) => void change(value)}
          trackColor={{ true: accent }}
        />
      </View>
      <Text variant="caption">
        Envie informações sobre telas visitadas e ciclos de foco e descanso para
        ajudar a melhorar a experiência. A coleta inclui dados técnicos do
        dispositivo e um identificador da instalação, sem seu nome, e-mail ou
        textos pessoais. Você pode desativar quando quiser, sem perder
        funcionalidades.
      </Text>
      {notice !== "" && <Text accessibilityRole="alert">{notice}</Text>}
    </Card>
  );
}
