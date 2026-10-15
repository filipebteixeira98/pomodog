import { useState } from "react";

import { Button } from "#src/components/ui/Button";
import {
  sharedProgress,
  type SharedProgress,
} from "#src/features/sharing/progressShare";
import { ProgressShareSheet } from "#src/features/sharing/ProgressShareSheet";
import { SocialIcons } from "#src/features/sharing/SocialIcons";
import type { Session } from "#src/timer";

export function ProgressShareButton({
  sessions,
  accent,
  reducedMotion,
}: {
  sessions: Session[];
  accent: string;
  reducedMotion: boolean;
}) {
  const [preview, setPreview] = useState<{
    progress: SharedProgress;
    accent: string;
  } | null>(null);
  return (
    <>
      <Button
        accent={accent}
        icon={<SocialIcons />}
        onPress={() =>
          setPreview({ progress: sharedProgress(sessions), accent })
        }
      >
        Compartilhe seu progresso
      </Button>
      {preview && (
        <ProgressShareSheet
          progress={preview.progress}
          accent={preview.accent}
          reducedMotion={reducedMotion}
          onClose={() => setPreview(null)}
        />
      )}
    </>
  );
}
