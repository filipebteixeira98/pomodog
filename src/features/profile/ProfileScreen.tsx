import type { ReactNode } from "react";

import { ScreenIntro } from "#src/components/ScreenIntro";
import type { CustomerSession } from "#src/domain/customer";
import { CustomerCard } from "#src/features/profile/CustomerCard";

export function ProfileScreen({
  session,
  accent,
  children,
}: {
  session: CustomerSession;
  accent: string;
  children: ReactNode;
}) {
  return (
    <>
      <ScreenIntro
        accent={accent}
        eyebrow="SEU PERFIL"
        title="Seu espaço."
        subtitle="Sua conta e seus dados, sob seu controle."
      />
      <CustomerCard session={session} accent={accent} />
      {children}
    </>
  );
}
