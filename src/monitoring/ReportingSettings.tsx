import Bug from "lucide-react-native/icons/bug";

import { OptionalCollectionSettings } from "#src/features/permissions/OptionalCollectionSettings";
import {
  reportingEnabled,
  reportingReady,
  setReportingEnabled,
  subscribeReporting,
} from "#src/monitoring/sentry";

const store = {
  subscribe: subscribeReporting,
  enabled: reportingEnabled,
  ready: reportingReady,
  setEnabled: setReportingEnabled,
};

export function ReportingSettings({ accent }: { accent: string }) {
  return (
    <OptionalCollectionSettings
      accent={accent}
      store={store}
      icon={<Bug size={23} color={accent} />}
      eyebrow="DIAGNÓSTICO OPCIONAL"
      title="Compartilhar falhas"
      accessibilityLabel="Compartilhar falhas do aplicativo"
    >
      Envia dados técnicos de falhas, sem nome, e-mail ou histórico de foco.
      Desative quando quiser.
    </OptionalCollectionSettings>
  );
}
