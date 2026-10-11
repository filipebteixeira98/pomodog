import type { ReactNode } from "react";
import { View } from "react-native";
import UserRound from "lucide-react-native/icons/user-round";

import { Card } from "#src/components/ui/Card";
import { Text } from "#src/components/ui/Text";
import { customerSummary, type CustomerSession } from "#src/domain/customer";

export function CustomerCard({
  session,
  accent,
  children,
}: {
  session: CustomerSession;
  accent: string;
  children?: ReactNode;
}) {
  const summary = customerSummary(session);
  return (
    <Card className="gap-3">
      <View className="flex-row items-center gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-soft">
          <UserRound color={accent} size={23} />
        </View>
        <Text variant="eyebrow">
          {session.status === "guest" ? "MODO LOCAL" : "SUA CONTA"}
        </Text>
      </View>
      <Text variant="heading">{summary.title}</Text>
      <Text>{summary.detail}</Text>
      <Text variant="caption">
        {session.status === "guest"
          ? "Seu histórico fica neste dispositivo até você entrar em uma conta."
          : "Seu progresso é salvo nesta conta e neste dispositivo."}
      </Text>
      {children}
    </Card>
  );
}
