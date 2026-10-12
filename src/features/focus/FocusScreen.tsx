import type { ComponentProps } from "react";

import { TimerCard } from "#src/features/focus/TimerCard";
import { UpdatesPreviewCard } from "#src/features/focus/UpdatesPreviewCard";

export function FocusScreen(props: ComponentProps<typeof TimerCard>) {
  const betweenSessions =
    props.timer.status === "idle" || props.timer.status === "completed";

  return (
    <>
      {betweenSessions ? <UpdatesPreviewCard /> : null}
      <TimerCard {...props} />
    </>
  );
}
