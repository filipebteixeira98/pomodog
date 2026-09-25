import { View, type ViewProps } from "react-native";
import { twMerge } from "tailwind-merge";

export function Card({
  className = "",
  ...props
}: ViewProps & { className?: string }) {
  return (
    <View
      className={twMerge(
        "rounded-3xl border border-line bg-surface p-6",
        className,
      )}
      {...props}
    />
  );
}
