export const palette = {
  white: "#FFFFFF",
  background: "#FDFDFD",
  surface: "#FEFEFE",
  surfaceMuted: "#F8F9FC",
  primary: "#204383",
  brandOrange: "#FF4D22",
  primarySoft: "#F2F4FD",
  gray100: "#F2F4F7",
  gray200: "#E5E5E5",
  gray500: "#827F7F",
  gray700: "#4B5563",
  gray900: "#111827",
  black: "#000000",
  danger: "#B3261E",
  success: "#2E7D32",
  warning: "#B26A00",
  info: "#0D74CE"
} as const;

export const colors = {
  background: palette.background,
  surface: palette.surface,
  surfaceMuted: palette.surfaceMuted,
  border: palette.gray200,
  shadow: "rgba(0, 0, 0, 0.25)",
  overlay: "rgba(0, 0, 0, 0.45)",
  text: palette.gray900,
  textMuted: palette.gray500,
  textSubtle: palette.gray700,
  textOnPrimary: palette.white,
  primary: palette.primary,
  brandOrange: palette.brandOrange,
  primaryPressed: "#183464",
  primarySoft: palette.primarySoft,
  iconDefault: palette.primary,
  iconMuted: "rgba(130, 127, 127, 0.65)",
  serviceIconBackground: palette.primarySoft,
  tabActive: palette.primary,
  tabInactive: "rgba(130, 127, 127, 0.65)",
  danger: palette.danger,
  success: palette.success,
  warning: palette.warning,
  info: palette.info
} as const;

export type AppColors = typeof colors;
