import type { ComponentProps } from "react";

import { TimerCard } from "#src/features/focus/TimerCard";
import { UpdatesPreviewCard } from "#src/features/focus/UpdatesPreviewCard";

type Props = ComponentProps<typeof TimerCard> & {
  updatesDismissed: boolean;
  onDismissUpdates: () => void;
};

export function FocusScreen({
  updatesDismissed,
  onDismissUpdates,
  ...props
}: Props) {
  const betweenSessions =
    props.timer.status === "idle" || props.timer.status === "completed";

  return (
    <>
      {betweenSessions && !updatesDismissed ? (
        <UpdatesPreviewCard onDismiss={onDismissUpdates} />
      ) : null}
      <TimerCard {...props} />
    </>
  );
}
