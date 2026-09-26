import AsyncStorage from "@react-native-async-storage/async-storage";

import { createPrototypeStore } from "./prototypeStore";

const store = createPrototypeStore(AsyncStorage);
export const loadPrototype = store.load;
export const savePrototype = store.save;
export const erasePrototype = store.erase;
