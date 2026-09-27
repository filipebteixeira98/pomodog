import type { ReactNode } from "react";

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
      <CustomerCard session={session} accent={accent} />
      {children}
    </>
  );
}
