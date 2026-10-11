import type { ReactNode } from "react";

import { Card } from "#src/components/ui/Card";
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
  const accountActions = (
    <AccountActions
      session={session}
      accent={accent}
      busy={authBusy}
      notice={authNotice}
      onSignIn={onSignIn}
      onSignOut={onSignOut}
      deletionPending={deletionPending}
    />
  );
  return (
    <>
      <CustomerCard session={session} accent={accent}>
        {session.status === "authenticated" && accountActions}
      </CustomerCard>
      {session.status === "guest" && (
        <Card className="gap-3">{accountActions}</Card>
      )}
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
