import AsyncStorage from "@react-native-async-storage/async-storage";
import * as firebaseAuth from "firebase/auth";

import { firebaseApp } from "#src/firebase/client";

export const auth = (() => {
  try {
    // Metro resolves the React Native entrypoint; TypeScript resolves web types.
    const native = firebaseAuth as typeof firebaseAuth & {
      getReactNativePersistence: (
        storage: typeof AsyncStorage,
      ) => firebaseAuth.Persistence;
    };
    return firebaseAuth.initializeAuth(firebaseApp, {
      persistence: native.getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "auth/already-initialized"
    )
      return firebaseAuth.getAuth(firebaseApp);
    throw error;
  }
})();
