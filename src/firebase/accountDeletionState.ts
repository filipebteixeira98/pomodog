import AsyncStorage from "@react-native-async-storage/async-storage";

const blocked = new Set<string>();
const key = (uid: string) => `pomodog.account-deletion.${uid}`;

export function accountDeletionBlocked(uid: string) {
  return blocked.has(uid);
}

export async function accountDeletionPending(uid: string) {
  const pending = (await AsyncStorage.getItem(key(uid))) !== null;
  if (pending) blocked.add(uid);
  return pending || blocked.has(uid);
}

export async function beginAccountDeletion(uid: string) {
  blocked.add(uid);
  await AsyncStorage.setItem(key(uid), "pending");
}

export async function finishAccountDeletion(uid: string) {
  await AsyncStorage.removeItem(key(uid));
  blocked.delete(uid);
}
