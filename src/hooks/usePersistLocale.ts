import { useMMKVString } from "react-native-mmkv";
import { appStorage } from "../storage/mmkv";
import { Configs } from "../constant/config";
import { AppLanguage } from "../i18n/Language";

export function usePersistedLocale() {
  const [locale, setLocale] = useMMKVString(
    Configs.storageKeys.locale,
    appStorage,
  );

  return {
    locale:
      locale === AppLanguage.en || locale === AppLanguage.km
        ? locale
        : undefined,
    setLocale,
  };
}
