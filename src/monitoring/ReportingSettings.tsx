import { useState, useSyncExternalStore } from "react";
import { Switch, View } from "react-native";
import Bug from "lucide-react-native/icons/bug";

import { Card } from "#src/components/ui/Card";
import { Text } from "#src/components/ui/Text";
import {
  reportingEnabled,
  reportingReady,
  setReportingEnabled,
  subscribeReporting,
} from "#src/monitoring/sentry";

export function ReportingSettings({ accent }: { accent: string }) {
  const enabled = useSyncExternalStore(
    subscribeReporting,
    reportingEnabled,
    () => false,
  );
  const ready = useSyncExternalStore(
    subscribeReporting,
    reportingReady,
    () => false,
  );
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  async function change(value: boolean) {
    if (busy) return;
    setBusy(true);
    setNotice("");
    try {
      await setReportingEnabled(value);
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
          <Bug size={23} color={accent} />
        </View>
        <Text variant="eyebrow">DIAGNÓSTICO OPCIONAL</Text>
      </View>
      <View className="flex-row items-center gap-3">
        <Text variant="label" className="flex-1">
          Enviar erros do aplicativo
        </Text>
        <Switch
          accessibilityLabel="Enviar erros do aplicativo ao Sentry"
          value={enabled}
          disabled={busy || !ready}
          onValueChange={(value) => void change(value)}
          trackColor={{ true: accent }}
        />
      </View>
      <Text variant="caption">
        Ajude a corrigir falhas enviando relatórios técnicos ao Sentry. Não
        enviamos seu nome, e-mail ou histórico de foco. Essa escolha vale apenas
        neste dispositivo.
      </Text>
      {notice !== "" && <Text accessibilityRole="alert">{notice}</Text>}
    </Card>
  );
}
