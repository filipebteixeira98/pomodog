import { ActivityIndicator, Image, Pressable } from "react-native";

import { Text } from "#src/components/ui/Text";

export function GoogleSignInButton({
  busy,
  onPress,
}: {
  busy: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={busy ? "Entrando com Google" : "Continuar com Google"}
      accessibilityState={{ disabled: busy, busy }}
      disabled={busy}
      onPress={onPress}
      className="min-h-[52px] flex-row items-center justify-center gap-3 rounded-full border px-5 py-3"
      style={({ pressed }) => ({
        backgroundColor: pressed ? "#F2F2F2" : "#FFFFFF",
        borderColor: "#747775",
        opacity: busy ? 0.65 : 1,
      })}
    >
      {busy ? (
        <ActivityIndicator size="small" color="#1F1F1F" />
      ) : (
        <Image
          source={require("#assets/brand/google-g.png")}
          style={{ width: 20, height: 20 }}
          resizeMode="contain"
          accessible={false}
        />
      )}
      <Text variant="label" className="text-[14px] text-[#1F1F1F]">
        {busy ? "Entrando…" : "Continuar com Google"}
      </Text>
    </Pressable>
  );
}
