import AsyncStorage from "@react-native-async-storage/async-storage";

import { createPrototypeStore, STORAGE_KEY } from "#src/storage/prototypeStore";

const store = createPrototypeStore(AsyncStorage);
export const loadPrototype = store.load;
export const savePrototype = store.save;
export const erasePrototype = store.erase;

export function accountStore(uid: string) {
  if (!uid || uid.includes("/")) throw new Error("Invalid account UID");
  return createPrototypeStore(AsyncStorage, `${STORAGE_KEY}.account.${uid}`);
}
