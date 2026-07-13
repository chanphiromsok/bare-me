import { createMMKV } from "react-native-mmkv";

export const appStorage = createMMKV({
  compareBeforeSet: true,
  encryptionType: "AES-128",
  id: "bare.app-storage",
});

export const persistMmkv = {
  getItem: (name: string): string | null => appStorage.getString(name) ?? null,
  removeItem: (name: string) => appStorage.remove(name),
  setItem: (name: string, value: string) => appStorage.set(name, value),
};
