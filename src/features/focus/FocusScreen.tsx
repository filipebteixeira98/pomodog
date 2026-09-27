import type { ComponentProps } from "react";

import { TimerCard } from "#src/features/focus/TimerCard";

export function FocusScreen(props: ComponentProps<typeof TimerCard>) {
  return <TimerCard {...props} />;
}
