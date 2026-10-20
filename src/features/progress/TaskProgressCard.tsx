import { View } from "react-native";
import ChartPie from "lucide-react-native/icons/chart-pie";
import Svg, { Circle, Path } from "react-native-svg";

import { Card } from "#src/components/ui/Card";
import { Text } from "#src/components/ui/Text";
import { summarizeTasks } from "#src/domain/progress";
import type { Session } from "#src/timer";

const colors = [
  "#718461",
  "#B18458",
  "#8A83AB",
  "#5D8C97",
  "#B66F79",
  "#A69778",
  "#94998C",
];

export function TaskProgressCard({ sessions }: { sessions: Session[] }) {
  const groups = summarizeTasks(sessions);
  const total = groups.reduce((sum, group) => sum + group.count, 0);
  let angle = -Math.PI / 2;

  return (
    <Card className="gap-4">
      <View className="gap-1">
        <Text variant="heading">Seu foco por tarefa</Text>
        <Text variant="caption">Ciclos concluídos · histórico salvo</Text>
      </View>
      {total === 0 ? (
        <View className="items-center gap-3 rounded-2xl bg-soft px-4 py-6">
          <ChartPie size={32} color={colors[0]} />
          <Text className="text-center">
            Adicione uma tarefa em Foco. Seus ciclos ganham espaço aqui.
          </Text>
        </View>
      ) : (
        <>
          <View
            className="items-center"
            aria-hidden
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <Svg width={184} height={184} viewBox="0 0 200 200">
              {groups.map((group, index) => {
                const start = angle;
                const sweep = (group.count / total) * Math.PI * 2;
                angle += sweep;
                return group.count === total ? (
                  <Circle
                    key={group.id}
                    cx={100}
                    cy={100}
                    r={96}
                    fill={colors[index]}
                  />
                ) : (
                  <Path
                    key={group.id}
                    d={`M 100 100 L ${100 + 96 * Math.cos(start)} ${100 + 96 * Math.sin(start)} A 96 96 0 ${sweep > Math.PI ? 1 : 0} 1 ${100 + 96 * Math.cos(angle)} ${100 + 96 * Math.sin(angle)} Z`}
                    fill={colors[index]}
                    stroke="#FFFEFA"
                    strokeWidth={2}
                  />
                );
              })}
            </Svg>
          </View>
          <Text variant="label">
            {total} {total === 1 ? "ciclo concluído" : "ciclos concluídos"}
          </Text>
          <View className="gap-3">
            {groups.map((group, index) => {
              const percent = (group.count / total) * 100;
              const share = percent < 1 ? "<1%" : Math.round(percent) + "%";
              return (
                <View
                  key={group.id}
                  accessible
                  accessibilityLabel={
                    group.label +
                    ": " +
                    group.count +
                    (group.count === 1 ? " ciclo, " : " ciclos, ") +
                    share
                  }
                  className="flex-row items-center gap-3"
                >
                  <View
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: colors[index] }}
                  />
                  <Text className="flex-1">{group.label}</Text>
                  <Text variant="caption">
                    {group.count} · {share}
                  </Text>
                </View>
              );
            })}
          </View>
          <Text variant="caption">
            Até 1.000 ciclos mais recentes. Sem tarefa inclui focos não
            nomeados.
          </Text>
        </>
      )}
    </Card>
  );
}
