import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, TextInput, View } from "react-native";
import X from "lucide-react-native/icons/x";

import { Button } from "#src/components/ui/Button";
import { Sheet } from "#src/components/ui/Sheet";
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
    return () => {
      mounted.current = false;
      sender.cancel();
    };
  }, [sender]);

  async function submit() {
    if (sender.busy()) return;
    setError("");
    setPending(true);
    try {
      if ((await sender.submit(draft)) && mounted.current) onSent();
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
    if (!sender.busy()) onClose();
  }

  return (
    <Sheet visible onClose={close} reducedMotion={reducedMotion} keyboardAware>
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
        <TextInput
          accessibilityLabel="Sua mensagem"
          placeholder="O que podemos melhorar?"
          placeholderTextColor="#73796D"
          multiline
          maxLength={feedbackMessageLimit}
          editable={!pending}
          value={draft.message}
          onChangeText={(message) => setDraft({ ...draft, message })}
          textAlignVertical="top"
          className="min-h-[128px] rounded-2xl border border-line bg-canvas p-3 font-sans text-[13px] leading-[21px] text-ink"
        />
        <Text variant="caption" className="text-right">
          {draft.message.length}/{feedbackMessageLimit}
        </Text>
      </View>
      <View className="gap-2">
        <Text variant="label">E-mail para resposta (opcional)</Text>
        <TextInput
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
          className="min-h-[48px] rounded-2xl border border-line bg-canvas px-3 py-2 font-sans text-[13px] text-ink"
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
    </Sheet>
  );
}
