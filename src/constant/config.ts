import SuperConfig from "react-native-superconfig";

const fallback = {
  API_URL: "http://localhost:4000",
  APP_ENV: "development",
  MMKV_ENCRYPTION_KEY: "bare-mmkv-key-32-byte-fallback!!",
} as const;

function getConfigValue(key: keyof typeof fallback): string {
  const config = SuperConfig as unknown as Record<string, string | undefined>;
  return config[key] || fallback[key];
}

export const Configs = {
  API_URL: getConfigValue("API_URL"),
  APP_ENV: getConfigValue("APP_ENV"),
  MMKV_ENCRYPTION_KEY: getConfigValue("MMKV_ENCRYPTION_KEY"),
  storageKeys: {
    accessToken: "auth.accessToken",
    appTheme: "preferences.theme",
    locale: "preferences.locale",
    userInfo: "auth.userInfo",
  },
} as const;
