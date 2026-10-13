import { View } from "react-native";
import MessageCircle from "lucide-react-native/icons/message-circle";

import { Button } from "#src/components/ui/Button";
import { Card } from "#src/components/ui/Card";
import { Text } from "#src/components/ui/Text";

export function FeedbackCard({
  accent,
  onOpen,
}: {
  accent: string;
  onOpen: () => void;
}) {
  return (
    <Card className="gap-4">
      <View className="flex-row items-center gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-soft">
          <MessageCircle size={22} color={accent} />
        </View>
        <View className="flex-1 gap-1">
          <Text variant="label">Sua opinião conta</Text>
          <Text variant="caption">Ajude nosso cantinho a crescer.</Text>
        </View>
      </View>
      <Button accent={accent} secondary onPress={onOpen}>
        Enviar feedback
      </Button>
    </Card>
  );
}
