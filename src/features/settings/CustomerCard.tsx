import { View } from "react-native";
import UserRound from "lucide-react-native/icons/user-round";

import { Card } from "../../components/ui/Card";
import { Text } from "../../components/ui/Text";
import { customerSummary, type CustomerSession } from "../../domain/customer";

export function CustomerCard({
  session,
  accent,
}: {
  session: CustomerSession;
  accent: string;
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
        O histórico de foco desta versão fica neste dispositivo.
      </Text>
    </Card>
  );
}
