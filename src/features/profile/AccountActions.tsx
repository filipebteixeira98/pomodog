import { Button } from "#src/components/ui/Button";
import { Card } from "#src/components/ui/Card";
import { Text } from "#src/components/ui/Text";
import type { CustomerSession } from "#src/domain/customer";
import { GoogleSignInButton } from "#src/features/profile/GoogleSignInButton";

export function AccountActions({
  session,
  accent,
  busy,
  notice,
  onSignIn,
  onSignOut,
}: {
  session: CustomerSession;
  accent: string;
  busy: boolean;
  notice: string;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
}) {
  return (
    <Card className="gap-3">
      {session.status === "guest" ? (
        <>
          <Text variant="heading">Continue com sua conta</Text>
          <Text>
            Entrar com Google salva seu progresso na sua conta. Seus dados
            locais serão vinculados após a sincronização.
          </Text>
          <GoogleSignInButton busy={busy} onPress={() => void onSignIn()} />
        </>
      ) : (
        <>
          <Text>Seu histórico de foco e preferências são sincronizados.</Text>
          <Button
            accent={accent}
            secondary
            disabled={busy}
            onPress={() => void onSignOut()}
          >
            Sair da conta
          </Button>
        </>
      )}
      {notice !== "" && <Text accessibilityRole="alert">{notice}</Text>}
    </Card>
  );
}
