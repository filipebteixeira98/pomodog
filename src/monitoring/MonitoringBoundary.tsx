import type { ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { ErrorBoundary } from "@sentry/react-native";

export function MonitoringBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={({ resetError }) => (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            padding: 24,
            backgroundColor: "#F8F7F2",
          }}
        >
          <Text
            accessibilityRole="alert"
            style={{ fontSize: 18, color: "#253322", marginBottom: 16 }}
          >
            Algo deu errado ao abrir seu cantinho.
          </Text>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={resetError}
            style={{
              padding: 16,
              borderRadius: 18,
              backgroundColor: "#4E6B55",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white" }}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
