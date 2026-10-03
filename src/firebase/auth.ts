import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import * as firebaseAuth from "firebase/auth";

import { firebaseApp } from "#src/firebase/client";
import {
  createSecureAuthStore,
  type AuthStorage,
} from "#src/storage/secureAuthStore";

const persistence = createSecureAuthStore(
  {
    getItem: (key) => SecureStore.getItemAsync(key),
    setItem: (key, value) =>
      SecureStore.setItemAsync(key, value, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      }),
    removeItem: (key) => SecureStore.deleteItemAsync(key),
  },
  AsyncStorage,
);

export const auth = (() => {
  try {
    // Metro resolves the React Native entrypoint; TypeScript resolves web types.
    const native = firebaseAuth as typeof firebaseAuth & {
      getReactNativePersistence: (
        storage: AuthStorage,
      ) => firebaseAuth.Persistence;
    };
    return firebaseAuth.initializeAuth(firebaseApp, {
      persistence: native.getReactNativePersistence(persistence),
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
