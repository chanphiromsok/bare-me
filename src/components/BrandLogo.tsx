import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "../theme";

const BrandLogo = memo(function BrandLogo() {
  return (
    <View className="h-12 justify-center">
      <View className="flex-row items-end">
        <Text style={styles.logoBs}>BS</Text>
        <Text style={styles.logoArrow}>›</Text>
      </View>
      <Text style={styles.logoExpress}>EXPRESS</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  logoArrow: {
    color: colors.brandOrange,
    fontSize: 27,
    fontStyle: "italic",
    fontWeight: "900",
    lineHeight: 29,
    marginLeft: 1,
  },
  logoBs: {
    color: colors.primary,
    fontSize: 28,
    fontStyle: "italic",
    fontWeight: "900",
    letterSpacing: -3,
    lineHeight: 29,
  },
  logoExpress: {
    color: colors.brandOrange,
    fontSize: 13,
    fontStyle: "italic",
    fontWeight: "900",
    letterSpacing: -0.5,
    lineHeight: 14,
  },
});

export default BrandLogo;
