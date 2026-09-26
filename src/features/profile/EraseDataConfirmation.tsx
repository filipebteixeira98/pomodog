import { Button } from "#src/components/ui/Button";
import { Sheet } from "#src/components/ui/Sheet";
import { Text } from "#src/components/ui/Text";

export function EraseDataConfirmation({
  visible,
  onClose,
  onConfirm,
  pending,
  notice,
  accent,
  reducedMotion,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pending: boolean;
  notice: string;
  accent: string;
  reducedMotion: boolean;
}) {
  return (
    <Sheet
      visible={visible}
      onClose={() => {
        if (!pending) onClose();
      }}
      reducedMotion={reducedMotion}
    >
      <Text variant="heading">Recomeçar neste dispositivo?</Text>
      <Text>
        Isso apaga seu histórico, a sessão atual e suas preferências do Pomodog.
        Não é possível desfazer. Cópias que você já exportou não serão apagadas.
      </Text>
      {notice !== "" && <Text accessibilityRole="alert">{notice}</Text>}
      <Button accent={accent} disabled={pending} onPress={onConfirm}>
        {pending ? "Apagando…" : "Sim, apagar meus dados"}
      </Button>
      <Button accent={accent} secondary disabled={pending} onPress={onClose}>
        Manter meus dados
      </Button>
    </Sheet>
  );
}
