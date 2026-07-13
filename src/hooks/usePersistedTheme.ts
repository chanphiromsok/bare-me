import { useMMKVString } from "react-native-mmkv";
import { Configs } from "../constant/config";
import { appStorage } from "../storage/mmkv";

export type AppThemePreference = "light" | "dark" | "system";

export function usePersistedTheme() {
  const [theme, setTheme] = useMMKVString(
    Configs.storageKeys.appTheme,
    appStorage,
  );

  return {
    setTheme,
    theme: (theme ?? "system") as AppThemePreference,
  };
}
