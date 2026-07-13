import { StyleSheet } from "react-native";

import { colors } from "../../../theme";

export const cardStyles = StyleSheet.create({
  card: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4.5,
    elevation: 4,
  },
});
