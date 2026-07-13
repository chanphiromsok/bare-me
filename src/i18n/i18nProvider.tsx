import { i18n } from "@lingui/core";
import { I18nProvider as LinguiI18nProvider } from "@lingui/react";
import type { ReactNode } from "react";

import { useLocaleLanguage } from "./i18n";

export default function I18nProvider({ children }: { children: ReactNode }) {
  useLocaleLanguage();

  return <LinguiI18nProvider i18n={i18n}>{children}</LinguiI18nProvider>;
}
