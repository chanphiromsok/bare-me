import { i18n } from "@lingui/core";
import { useEffect } from "react";
import { usePersistedLocale } from "../hooks/usePersistLocale";
import { messages as enMessages } from "../locales/en/messages.po";
import { messages as kmMessages } from "../locales/km/messages.po";
import { AppLanguage } from "./Language";

export function dynamicActivate(locale: AppLanguage) {
  switch (locale) {
    case AppLanguage.km: {
      i18n.loadAndActivate({ locale, messages: kmMessages });
      break;
    }
    default: {
      i18n.loadAndActivate({ locale, messages: enMessages });
      break;
    }
  }
}

export function useLocaleLanguage() {
  const { locale } = usePersistedLocale();
  useEffect(() => {
    if (!locale) {
      dynamicActivate(AppLanguage.en);
    } else {
      dynamicActivate(locale as AppLanguage);
    }
  }, [locale]);
}
