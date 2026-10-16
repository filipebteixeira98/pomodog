import {
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import {
  BackHandler,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetHandle,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
  type BottomSheetHandleProps,
} from "@gorhom/bottom-sheet";
import X from "lucide-react-native/icons/x";
import { ReduceMotion } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "#src/components/ui/Text";

export function BottomSheet({
  title,
  accessibilityLabel = title,
  closeLabel,
  reducedMotion,
  busy = false,
  canDismiss,
  modalRef,
  onDismiss,
  children,
}: {
  title: string;
  accessibilityLabel?: string;
  closeLabel: string;
  reducedMotion: boolean;
  busy?: boolean;
  canDismiss: () => boolean;
  modalRef?: RefObject<BottomSheetModal | null>;
  onDismiss: () => void;
  children: ReactNode;
}) {
  const internalRef = useRef<BottomSheetModal>(null);
  const sheet = modalRef ?? internalRef;
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    sheet.current?.present();
  }, [sheet]);

  const close = useCallback(() => {
    if (!busy && canDismiss()) sheet.current?.dismiss();
  }, [busy, canDismiss, sheet]);

  useEffect(() => {
    const back = BackHandler.addEventListener("hardwareBackPress", () => {
      close();
      return true;
    });
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    if (Platform.OS === "web") document.addEventListener("keydown", escape);
    return () => {
      back.remove();
      if (Platform.OS === "web")
        document.removeEventListener("keydown", escape);
    };
  }, [close]);

  const backdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.4}
        pressBehavior={busy ? "none" : "close"}
        accessibilityLabel={closeLabel}
        accessibilityHint="Toque fora para voltar aos ajustes"
      />
    ),
    [busy, closeLabel],
  );

  return (
    <BottomSheetModal
      ref={sheet}
      enableDynamicSizing
      maxDynamicContentSize={height - insets.top - 24}
      topInset={insets.top + 24}
      enablePanDownToClose={!busy}
      enableHandlePanningGesture={!busy}
      enableContentPanningGesture={!busy}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      enableBlurKeyboardOnGesture
      android_keyboardInputMode="adjustPan"
      overrideReduceMotion={
        reducedMotion ? ReduceMotion.Always : ReduceMotion.System
      }
      backdropComponent={backdrop}
      backgroundStyle={styles.background}
      style={{
        width: Math.min(width, 640),
        marginHorizontal: Math.max(0, (width - 640) / 2),
      }}
      handleComponent={SheetHandle}
      onDismiss={() => {
        // A gesture already in flight must not discard an active operation.
        if (!canDismiss()) sheet.current?.present();
        else onDismiss();
      }}
      accessible={false}
      accessibilityLabel={accessibilityLabel}
      accessibilityViewIsModal
    >
      <BottomSheetScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 24,
          gap: 20,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        accessibilityViewIsModal
      >
        <View className="flex-row items-center gap-2">
          <Text variant="heading" className="flex-1">
            {title}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={closeLabel}
            disabled={busy}
            onPress={close}
            className="-mr-2 h-11 w-11 items-center justify-center rounded-full active:bg-soft disabled:opacity-40"
          >
            <X size={20} color="#73796D" />
          </Pressable>
        </View>
        {children}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

function SheetHandle(props: BottomSheetHandleProps) {
  return (
    <BottomSheetHandle
      {...props}
      accessibilityLabel="Arrastar painel"
      accessibilityHint="Arraste para baixo para fechar"
      indicatorStyle={styles.indicator}
    />
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: "#FFFEFA",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  indicator: { backgroundColor: "#C6CABD", width: 36 },
});
