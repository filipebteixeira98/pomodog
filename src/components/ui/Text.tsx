import { Text as NativeText, type TextProps } from "react-native";
import { twMerge } from "tailwind-merge";

const variants = {
  body: "font-sans text-[13px] leading-[21px] text-muted",
  title:
    "font-poppins-medium text-[25px] leading-[34px] tracking-[-0.8px] text-ink",
  heading: "font-poppins-medium text-xl leading-7 text-ink",
  label: "font-poppins-medium text-[13px] text-ink",
  caption: "font-sans text-[11px] leading-[18px] text-muted",
  eyebrow: "font-poppins-semibold text-[10px] tracking-[1.8px] text-muted",
};

export function Text({
  variant = "body",
  className = "",
  ...props
}: TextProps & { variant?: keyof typeof variants; className?: string }) {
  return (
    <NativeText className={twMerge(variants[variant], className)} {...props} />
  );
}
