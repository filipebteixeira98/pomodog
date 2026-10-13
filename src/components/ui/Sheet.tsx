import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  View,
} from "react-native";

export function Sheet({
  visible,
  onClose,
  reducedMotion,
  keyboardAware = false,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  reducedMotion: boolean;
  keyboardAware?: boolean;
  children: ReactNode;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType={reducedMotion ? "none" : "fade"}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        enabled={keyboardAware}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 items-center justify-center bg-[#25332266] p-5"
      >
        <View
          accessibilityViewIsModal
          className="max-h-[90%] w-full max-w-[460px] rounded-3xl bg-surface p-6"
        >
          <ScrollView
            contentContainerClassName="gap-5"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps={keyboardAware ? "handled" : "never"}
          >
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
