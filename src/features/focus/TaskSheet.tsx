import { useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { BottomSheetModal, BottomSheetTextInput } from "@gorhom/bottom-sheet";

import { BottomSheet } from "#src/components/ui/BottomSheet";
import { Button, TextButton } from "#src/components/ui/Button";
import { Text } from "#src/components/ui/Text";
import { normalizeTask, taskNameLimit } from "#src/domain/focusTask";

export function TaskSheet({
  task,
  accent,
  reducedMotion,
  onSave,
  onClose,
}: {
  task?: string;
  accent: string;
  reducedMotion: boolean;
  onSave: (task: string) => void;
  onClose: () => void;
}) {
  const sheet = useRef<BottomSheetModal>(null);
  const [name, setName] = useState(task ?? "");

  function save(value = name) {
    onSave(normalizeTask(value) ?? "");
    sheet.current?.dismiss();
  }

  return (
    <BottomSheet
      modalRef={sheet}
      title="Qual é o seu foco?"
      closeLabel="Fechar tarefa"
      reducedMotion={reducedMotion}
      canDismiss={() => true}
      onDismiss={onClose}
    >
      <Text>Uma tarefa por vez. Ela acompanha seus próximos ciclos.</Text>
      <View className="gap-2">
        <Text variant="label">Nome da tarefa · opcional</Text>
        <BottomSheetTextInput
          accessibilityLabel="Nome da tarefa"
          placeholder="Ex.: Estudar inglês"
          placeholderTextColor="#73796D"
          value={name}
          onChangeText={setName}
          maxLength={taskNameLimit}
          returnKeyType="done"
          onSubmitEditing={() => save()}
          style={[styles.input, { borderColor: accent }]}
        />
        <Text variant="caption">
          {name.length}/{taskNameLimit} · aparece em Progresso
        </Text>
      </View>
      <View className="gap-1">
        <Button accent={accent} onPress={() => save()}>
          Salvar tarefa
        </Button>
        {task && (
          <TextButton underline={false} onPress={() => save("")}>
            Continuar sem tarefa
          </TextButton>
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    color: "#343C32",
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
  },
});
