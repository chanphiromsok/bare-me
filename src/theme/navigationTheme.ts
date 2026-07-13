import { DefaultTheme, type Theme } from "@react-navigation/native";

import { colors } from "./colors";

export const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.danger
  }
} satisfies Theme;
