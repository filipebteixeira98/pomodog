import AsyncStorage from "@react-native-async-storage/async-storage";

import { createPrototypeStore, STORAGE_KEY } from "#src/storage/prototypeStore";

const store = createPrototypeStore(AsyncStorage);
export const loadPrototype = store.load;
export const savePrototype = store.save;
export const erasePrototype = store.erase;

const accounts = new Map<string, ReturnType<typeof createPrototypeStore>>();

export function accountStore(uid: string) {
  if (!uid || uid.includes("/")) throw new Error("Invalid account UID");
  let account = accounts.get(uid);
  if (!account) {
    account = createPrototypeStore(
      AsyncStorage,
      `${STORAGE_KEY}.account.${uid}`,
    );
    accounts.set(uid, account);
  }
  return account;
}
