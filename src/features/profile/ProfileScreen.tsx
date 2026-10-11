import type { ReactNode } from "react";

import type { CustomerSession } from "#src/domain/customer";
import { PrivacyCard } from "#src/features/privacy/PrivacyDetails";
import { AccountActions } from "#src/features/profile/AccountActions";
import { AccountDeletionCard } from "#src/features/profile/AccountDeletionCard";
import { CustomerCard } from "#src/features/profile/CustomerCard";

export function ProfileScreen({
  session,
  accent,
  children,
  authBusy,
  authNotice,
  onSignIn,
  onSignOut,
  onDeleteAccount,
  deletionPending,
  reducedMotion,
}: {
  session: CustomerSession;
  accent: string;
  children: ReactNode;
  authBusy: boolean;
  authNotice: string;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onDeleteAccount: () => Promise<boolean>;
  deletionPending: boolean;
  reducedMotion: boolean;
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
        deletionPending={deletionPending}
      />
      {children}
      <PrivacyCard accent={accent} reducedMotion={reducedMotion} />
      {session.status === "authenticated" && (
        <AccountDeletionCard
          session={session}
          accent={accent}
          busy={authBusy}
          notice={authNotice}
          onDeleteAccount={onDeleteAccount}
          deletionPending={deletionPending}
          reducedMotion={reducedMotion}
        />
      )}
    </>
  );
}
