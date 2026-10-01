import { ScrollView, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import ArrowRight from "lucide-react-native/icons/arrow-right";
import Coffee from "lucide-react-native/icons/coffee";
import Timer from "lucide-react-native/icons/timer";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppHeader } from "#src/components/AppHeader";
import { GoogleSignInButton } from "#src/components/GoogleSignInButton";
import { Button } from "#src/components/ui/Button";
import { Text } from "#src/components/ui/Text";
import { mascot } from "#src/domain/mascot";
import { WelcomeArtwork } from "#src/features/welcome/WelcomeArtwork";

export function WelcomeScreen({
  accent,
  reducedMotion,
  busy,
  notice,
  onSignIn,
  onContinueLocally,
}: {
  accent: string;
  reducedMotion: boolean;
  busy: boolean;
  notice: string;
  onSignIn: () => Promise<void>;
  onContinueLocally: () => void;
}) {
  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <StatusBar style="dark" />
      <View className="w-full max-w-[640px] flex-1 self-center">
        <AppHeader accent={accent} />
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingBottom: 24,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 justify-center gap-5 py-4">
            <View className="items-center gap-2">
              <Text variant="eyebrow">UM COMPANHEIRO PARA SEU FOCO</Text>
              <Text
                accessibilityRole="header"
                className="font-poppins-semibold text-center text-[30px] leading-[39px] tracking-[-1px] text-ink"
              >
                Seu foco começa com um pequeno passo.
              </Text>
              <Text className="max-w-[320px] text-center">
                Foque, faça uma pausa e recomece com {mascot.name} ao seu lado.
              </Text>
            </View>
            <WelcomeArtwork accent={accent} reducedMotion={reducedMotion} />
            <View className="flex-row flex-wrap items-center justify-center gap-3">
              <View className="flex-row items-center gap-1.5 rounded-full bg-soft px-3 py-2">
                <Timer size={15} color={accent} />
                <Text variant="caption" className="text-ink">
                  25 min de foco
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5 rounded-full bg-soft px-3 py-2">
                <Coffee size={15} color={accent} />
                <Text variant="caption" className="text-ink">
                  5 min de pausa
                </Text>
              </View>
            </View>
          </View>
          <View className="gap-3 pt-2">
            {notice !== "" && (
              <Text accessibilityRole="alert" className="text-center">
                {notice}
              </Text>
            )}
            <GoogleSignInButton busy={busy} onPress={() => void onSignIn()} />
            <Button
              accent={accent}
              secondary
              disabled={busy}
              onPress={onContinueLocally}
              icon={<ArrowRight size={18} color="#343C32" />}
            >
              Continuar sem conta
            </Button>
            <Text variant="caption" className="text-center">
              Sem conta, seu progresso fica neste dispositivo e funciona
              offline. Com Google, ele é salvo na sua conta.
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
