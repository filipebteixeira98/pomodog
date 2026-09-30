import { useState } from "react";
import { View } from "react-native";
import Trash from "lucide-react-native/icons/trash";

import { Button, destructiveColor } from "#src/components/ui/Button";
import { Card } from "#src/components/ui/Card";
import { Sheet } from "#src/components/ui/Sheet";
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
  onDeleteAccount,
  deletionPending,
  reducedMotion,
}: {
  session: CustomerSession;
  accent: string;
  busy: boolean;
  notice: string;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onDeleteAccount: () => Promise<boolean>;
  deletionPending: boolean;
  reducedMotion: boolean;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  async function confirm() {
    if (await onDeleteAccount()) setConfirmDelete(false);
  }
  return (
    <>
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
            <Text>
              {deletionPending
                ? "A sincronização está suspensa até concluir a exclusão da conta."
                : "Seu histórico de foco e preferências são sincronizados."}
            </Text>
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
      {session.status === "authenticated" && (
        <Card className="gap-3 border-[#F4C7C3] bg-[#FFF1F0]">
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-[#FDE0DC]">
              <Trash size={23} color={destructiveColor} />
            </View>
            <Text variant="eyebrow" className="text-[#B42318]">
              EXCLUSÃO DE CONTA
            </Text>
          </View>
          <Text variant="heading">Excluir sua conta</Text>
          <Text>
            Sua conta e os dados vinculados serão apagados. Essa ação não pode
            ser desfeita.
          </Text>
          <Button
            accent={accent}
            secondary
            destructive
            disabled={busy}
            icon={<Trash size={18} color={destructiveColor} />}
            onPress={() => setConfirmDelete(true)}
          >
            {deletionPending
              ? "Concluir exclusão da conta"
              : "Excluir minha conta"}
          </Button>
        </Card>
      )}
      {session.status === "authenticated" && (
        <Sheet
          visible={confirmDelete}
          onClose={() => {
            if (!busy) setConfirmDelete(false);
          }}
          reducedMotion={reducedMotion}
        >
          <Text variant="heading">Excluir sua conta?</Text>
          <Text>
            Isso remove sua conta, histórico de foco, preferências e dados do
            Nino salvos na nuvem e neste dispositivo. Não é possível desfazer.
          </Text>
          <Text variant="caption">
            {session.customer.email ?? session.customer.displayName}
          </Text>
          <Text>Confirme sua identidade usando a mesma conta Google.</Text>
          {notice !== "" && <Text accessibilityRole="alert">{notice}</Text>}
          <Button
            accent={accent}
            destructive
            disabled={busy}
            onPress={() => void confirm()}
          >
            {busy
              ? "Excluindo…"
              : deletionPending
                ? "Concluir exclusão"
                : "Sim, excluir minha conta"}
          </Button>
          <Button
            accent={accent}
            secondary
            disabled={busy}
            onPress={() => setConfirmDelete(false)}
          >
            {deletionPending ? "Fechar" : "Manter minha conta"}
          </Button>
        </Sheet>
      )}
    </>
  );
}
