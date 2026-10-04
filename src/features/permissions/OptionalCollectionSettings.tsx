import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { Switch, View } from "react-native";

import { Card } from "#src/components/ui/Card";
import { Text } from "#src/components/ui/Text";

type CollectionStore = {
  subscribe: (listener: () => void) => () => void;
  enabled: () => boolean;
  ready: () => boolean;
  setEnabled: (value: boolean) => Promise<void>;
};
type Props = {
  accent: string;
  store: CollectionStore;
  icon: ReactNode;
  eyebrow: string;
  title: string;
  accessibilityLabel: string;
  children: ReactNode;
};

export function OptionalCollectionSettings({
  accent,
  store,
  icon,
  eyebrow,
  title,
  accessibilityLabel,
  children,
}: Props) {
  const enabled = useSyncExternalStore(
    store.subscribe,
    store.enabled,
    () => false,
  );
  const ready = useSyncExternalStore(store.subscribe, store.ready, () => false);
  const pending = useRef(false);
  const mounted = useRef(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  async function change(value: boolean) {
    if (pending.current || !store.ready()) return;
    pending.current = true;
    setBusy(true);
    setNotice("");
    try {
      await store.setEnabled(value);
    } catch {
      if (mounted.current)
        setNotice("Não foi possível salvar essa escolha. Tente novamente.");
    } finally {
      pending.current = false;
      if (mounted.current) setBusy(false);
    }
  }

  return (
    <Card className="gap-3">
      <View className="flex-row items-center gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-soft">
          {icon}
        </View>
        <Text variant="eyebrow">{eyebrow}</Text>
      </View>
      <View className="flex-row items-center gap-3">
        <Text variant="label" className="flex-1">
          {title}
        </Text>
        <Switch
          accessibilityLabel={accessibilityLabel}
          value={enabled}
          disabled={busy || !ready}
          onValueChange={(value) => void change(value)}
          trackColor={{ true: accent }}
        />
      </View>
      <Text variant="caption">{children}</Text>
      {notice !== "" && <Text accessibilityRole="alert">{notice}</Text>}
    </Card>
  );
}
