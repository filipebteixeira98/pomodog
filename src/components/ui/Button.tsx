import type { ReactNode } from "react";
import { Pressable } from "react-native";
import { Text } from "./Text";

type Props = {
  children: ReactNode;
  onPress: () => void;
  accent: string;
  secondary?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
};

export function Button({
  children,
  onPress,
  accent,
  secondary = false,
  disabled = false,
  icon,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      className="min-h-[52px] flex-row items-center justify-center gap-2 rounded-2xl px-4 py-3.5 active:opacity-80 disabled:opacity-40"
      style={{
        backgroundColor: secondary ? "#ECEEE6" : accent,
      }}
    >
      {icon}
      <Text
        variant="label"
        className="text-center text-[14px]"
        style={{ color: secondary ? "#343C32" : "#FFFFFF" }}
      >
        {children}
      </Text>
    </Pressable>
  );
}

export function TextButton({
  children,
  onPress,
  disabled = false,
}: Pick<Props, "children" | "onPress" | "disabled">) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      className="min-h-11 items-center justify-center px-2"
    >
      <Text variant="caption" className="underline">
        {children}
      </Text>
    </Pressable>
  );
}
