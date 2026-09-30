import type { ReactNode } from "react";

import type { CustomerSession } from "#src/domain/customer";
import { AccountActions } from "#src/features/profile/AccountActions";
import { CustomerCard } from "#src/features/profile/CustomerCard";

export function ProfileScreen({
  session,
  accent,
  children,
  authBusy,
  authNotice,
  onSignIn,
  onSignOut,
}: {
  session: CustomerSession;
  accent: string;
  children: ReactNode;
  authBusy: boolean;
  authNotice: string;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
}) {
  return (
    <>
      <CustomerCard session={session} accent={accent} />
      <AccountActions
        session={session}
        accent={accent}
        busy={authBusy}
        notice={authNotice}
        onSignIn={onSignIn}
        onSignOut={onSignOut}
      />
      {children}
    </>
  );
}
