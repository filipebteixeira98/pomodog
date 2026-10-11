import LogOut from "lucide-react-native/icons/log-out";

import { GoogleSignInButton } from "#src/components/GoogleSignInButton";
import { Button } from "#src/components/ui/Button";
import { Text } from "#src/components/ui/Text";
import type { CustomerSession } from "#src/domain/customer";

export function AccountActions({
  session,
  accent,
  busy,
  notice,
  onSignIn,
  onSignOut,
  deletionPending,
}: {
  session: CustomerSession;
  accent: string;
  busy: boolean;
  notice: string;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  deletionPending: boolean;
}) {
  return (
    <>
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
          {deletionPending && (
            <Text>
              A sincronização está suspensa até concluir a exclusão da conta.
            </Text>
          )}
          <Button
            accent={accent}
            secondary
            disabled={busy}
            icon={<LogOut size={18} color={accent} />}
            onPress={() => void onSignOut()}
          >
            Sair da conta
          </Button>
        </>
      )}
      {notice !== "" && <Text accessibilityRole="alert">{notice}</Text>}
    </>
  );
}
