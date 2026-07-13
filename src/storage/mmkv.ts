import { createMMKV } from "react-native-mmkv";

import { Configs } from "../constant/config";

export const appStorage = createMMKV({
  encryptionKey: Configs.MMKV_ENCRYPTION_KEY,
  encryptionType: "AES-128",
  id: "bare.app-storage",
});

export const persistMmkv = {
  getItem: (name: string): string | null => appStorage.getString(name) ?? null,
  removeItem: (name: string) => appStorage.remove(name),
  setItem: (name: string, value: string) => appStorage.set(name, value),
};
