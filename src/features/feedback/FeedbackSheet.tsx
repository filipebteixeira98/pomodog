import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetHandle,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
  type BottomSheetBackdropProps,
  type BottomSheetHandleProps,
} from "@gorhom/bottom-sheet";
import X from "lucide-react-native/icons/x";
import { ReduceMotion } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "#src/components/ui/Button";
import { Text } from "#src/components/ui/Text";
import { createPosthogFeedbackTransport } from "#src/features/feedback/posthog";
import {
  createFeedbackSender,
  feedbackCategories,
  feedbackEmailLimit,
  feedbackMessageLimit,
  FeedbackValidationError,
  type FeedbackDraft,
} from "#src/features/feedback/submission";
import { feedbackSurvey } from "#src/features/feedback/survey";

export function FeedbackSheet({
  accent,
  reducedMotion,
  suggestedEmail,
  onClose,
  onSent,
}: {
  accent: string;
  reducedMotion: boolean;
  suggestedEmail?: string;
  onClose: () => void;
  onSent: () => void;
}) {
  const sheet = useRef<BottomSheetModal>(null);
  const sent = useRef(false);
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<FeedbackDraft>({
    category: "Sugestão",
    message: "",
    email: suggestedEmail ?? "",
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const mounted = useRef(true);
  const [sender] = useState(() =>
    createFeedbackSender({
      send: createPosthogFeedbackTransport(feedbackSurvey),
    }),
  );
  useEffect(() => {
    mounted.current = true;
    sheet.current?.present();
    const back = BackHandler.addEventListener("hardwareBackPress", () => {
      if (!sender.busy()) sheet.current?.dismiss();
      return true;
    });
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !sender.busy()) sheet.current?.dismiss();
    };
    if (Platform.OS === "web") document.addEventListener("keydown", escape);
    return () => {
      back.remove();
      if (Platform.OS === "web")
        document.removeEventListener("keydown", escape);
      mounted.current = false;
      sender.cancel();
    };
  }, [sender]);

  async function submit() {
    if (sender.busy() || sent.current) return;
    setError("");
    setPending(true);
    try {
      if ((await sender.submit(draft)) && mounted.current) {
        sent.current = true;
        sheet.current?.dismiss();
      }
    } catch (failure) {
      if (mounted.current)
        setError(
          failure instanceof FeedbackValidationError
            ? failure.message
            : "Não foi possível enviar. Sua mensagem continua aqui para tentar novamente.",
        );
    } finally {
      if (mounted.current) setPending(false);
    }
  }

  function close() {
    if (!sender.busy()) sheet.current?.dismiss();
  }

  function dismissed() {
    // A gesture already in flight must not discard an active submission.
    if (sender.busy()) {
      sheet.current?.present();
      return;
    }
    if (sent.current) onSent();
    else onClose();
  }

  const backdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.4}
        pressBehavior={pending ? "none" : "close"}
        accessibilityLabel="Fechar formulário de feedback"
        accessibilityHint="Toque fora para voltar aos ajustes"
      />
    ),
    [pending],
  );

  return (
    <BottomSheetModal
      ref={sheet}
      enableDynamicSizing
      maxDynamicContentSize={height - insets.top - 24}
      topInset={insets.top + 24}
      enablePanDownToClose={!pending}
      enableHandlePanningGesture={!pending}
      enableContentPanningGesture={!pending}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      enableBlurKeyboardOnGesture
      android_keyboardInputMode="adjustPan"
      overrideReduceMotion={
        reducedMotion ? ReduceMotion.Always : ReduceMotion.System
      }
      backdropComponent={backdrop}
      backgroundStyle={styles.background}
      style={{
        width: Math.min(width, 640),
        marginHorizontal: Math.max(0, (width - 640) / 2),
      }}
      handleComponent={FeedbackHandle}
      onDismiss={dismissed}
      accessible={false}
      accessibilityLabel="Formulário de feedback"
      accessibilityViewIsModal
    >
      <BottomSheetScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 24,
          gap: 20,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center gap-2">
          <Text variant="heading" className="flex-1">
            Sua opinião conta
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fechar formulário de feedback"
            disabled={pending}
            onPress={close}
            className="-mr-2 h-11 w-11 items-center justify-center rounded-full active:bg-soft disabled:opacity-40"
          >
            <X size={20} color="#73796D" />
          </Pressable>
        </View>
        <View className="gap-2">
          <Text variant="label">Tipo de feedback</Text>
          <View className="flex-row flex-wrap gap-2">
            {feedbackCategories.map((category) => (
              <Pressable
                key={category}
                accessibilityRole="radio"
                accessibilityLabel={category}
                accessibilityState={{ checked: draft.category === category }}
                disabled={pending}
                onPress={() => setDraft({ ...draft, category })}
                className="min-h-11 items-center justify-center rounded-xl px-3 active:opacity-80 disabled:opacity-40"
                style={{
                  backgroundColor:
                    draft.category === category ? accent : "#EEF0E6",
                }}
              >
                <Text
                  variant="label"
                  style={{
                    color: draft.category === category ? "#FFFFFF" : "#343C32",
                  }}
                >
                  {category}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View className="gap-2">
          <Text variant="label">Sua mensagem</Text>
          <BottomSheetTextInput
            accessibilityLabel="Sua mensagem"
            placeholder="O que podemos melhorar?"
            placeholderTextColor="#73796D"
            multiline
            maxLength={feedbackMessageLimit}
            editable={!pending}
            value={draft.message}
            onChangeText={(message) => setDraft({ ...draft, message })}
            textAlignVertical="top"
            style={[styles.input, styles.message]}
          />
          <Text variant="caption" className="text-right">
            {draft.message.length}/{feedbackMessageLimit}
          </Text>
        </View>
        <View className="gap-2">
          <Text variant="label">E-mail para resposta (opcional)</Text>
          <BottomSheetTextInput
            accessibilityLabel="E-mail para resposta, opcional"
            placeholder="Deixe em branco se preferir"
            placeholderTextColor="#73796D"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={feedbackEmailLimit}
            editable={!pending}
            value={draft.email}
            onChangeText={(email) => setDraft({ ...draft, email })}
            style={styles.input}
          />
        </View>
        <Text variant="caption">
          Ao enviar, você compartilha este feedback e o contato informado com a
          equipe. Evite incluir dados sensíveis.
        </Text>
        {error !== "" && (
          <Text
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            variant="caption"
            className="text-[#B42318]"
          >
            {error}
          </Text>
        )}
        <Button
          accent={accent}
          disabled={pending || !draft.message.trim()}
          onPress={() => void submit()}
          icon={
            pending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : undefined
          }
        >
          {pending ? "Enviando…" : "Enviar feedback"}
        </Button>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

function FeedbackHandle(props: BottomSheetHandleProps) {
  return (
    <BottomSheetHandle
      {...props}
      accessibilityLabel="Formulário de feedback"
      accessibilityHint="Arraste para baixo para fechar"
      indicatorStyle={styles.indicator}
    />
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: "#FFFEFA",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  indicator: { backgroundColor: "#C6CABD", width: 36 },
  input: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E7E8DE",
    backgroundColor: "#F8F7F2",
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: "#343C32",
  },
  message: { minHeight: 128, padding: 12, lineHeight: 21 },
});
