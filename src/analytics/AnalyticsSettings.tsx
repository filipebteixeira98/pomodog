import ChartNoAxesColumn from "lucide-react-native/icons/chart-no-axes-column";

import {
  analyticsEnabled,
  analyticsReady,
  analyticsSupported,
  setAnalyticsEnabled,
  subscribeAnalytics,
} from "#src/analytics/service";
import { OptionalCollectionSettings } from "#src/features/permissions/OptionalCollectionSettings";

const store = {
  subscribe: subscribeAnalytics,
  enabled: analyticsEnabled,
  ready: analyticsReady,
  setEnabled: setAnalyticsEnabled,
};

export function AnalyticsSettings({ accent }: { accent: string }) {
  if (!analyticsSupported) return null;
  return (
    <OptionalCollectionSettings
      accent={accent}
      store={store}
      icon={<ChartNoAxesColumn size={23} color={accent} />}
      eyebrow="USO OPCIONAL"
      title="Compartilhar uso"
      accessibilityLabel="Compartilhar uso do aplicativo"
    >
      Envia telas visitadas, ciclos, dados do dispositivo e identificador da
      instalação. Sem nome, e-mail ou textos pessoais. Desative quando quiser.
    </OptionalCollectionSettings>
  );
}
