import { NativeModules } from "react-native";

import type { ProgressWidgetNative } from "#src/widgets/progressWidget";

export const nativeProgress = NativeModules.PomodogProgressWidget as
  ProgressWidgetNative | undefined;
