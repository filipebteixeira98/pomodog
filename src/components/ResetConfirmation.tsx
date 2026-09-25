import { Button } from "./ui/Button";
import { Sheet } from "./ui/Sheet";
import { Text } from "./ui/Text";

export function ResetConfirmation({
  visible,
  onClose,
  onConfirm,
  accent,
  reducedMotion,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  accent: string;
  reducedMotion: boolean;
}) {
  return (
    <Sheet visible={visible} onClose={onClose} reducedMotion={reducedMotion}>
      <Text variant="heading">Começar de novo?</Text>
      <Text>
        O tempo desta sessão será descartado. As sessões já concluídas continuam
        no seu progresso.
      </Text>
      <Button accent={accent} onPress={onConfirm}>
        Reiniciar sessão
      </Button>
      <Button accent={accent} secondary onPress={onClose}>
        Continuar como estou
      </Button>
    </Sheet>
  );
}
