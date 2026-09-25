import { Pressable, View } from "react-native";

import { Text } from "./Text";

type Option<T> = {
  value: T;
  label: string;
  color?: string;
  accessibilityLabel?: string;
};
export function ChoiceGroup<T extends number>({
  options,
  value,
  onChange,
  accent,
  disabled = false,
}: {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  accent: string;
  disabled?: boolean;
}) {
  return (
    <View className="flex-row gap-2">
      {options.map((option) => (
        <Pressable
          key={option.value}
          accessibilityRole="button"
          accessibilityLabel={option.accessibilityLabel ?? option.label}
          accessibilityState={{ selected: value === option.value, disabled }}
          disabled={disabled}
          onPress={() => onChange(option.value)}
          className="min-h-12 flex-1 items-center justify-center rounded-xl border border-line px-1 py-3"
          style={{
            opacity: disabled ? 0.5 : 1,
            borderColor: value === option.value ? accent : "#E7E8DE",
            backgroundColor: value === option.value ? "#EFF1E9" : undefined,
          }}
        >
          {option.color && (
            <View
              className="mb-1.5 h-5 w-5 rounded-full"
              style={{ backgroundColor: option.color }}
            />
          )}
          <Text variant="caption" className="text-ink">
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
