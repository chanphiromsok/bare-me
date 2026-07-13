import { memo } from "react";
import { Pressable, View } from "react-native";

import BrandLogo from "../../../components/BrandLogo";
import AppIcon from "../../../components/icons/AppIcon";
import { colors } from "../../../theme";

const HomeHeader = memo(function HomeHeader() {
  return (
    <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
      <BrandLogo />

      <Pressable
        accessibilityLabel="Notifications"
        accessibilityRole="button"
        className="h-10 w-10 items-center justify-center rounded-full active:bg-primary-soft"
      >
        <AppIcon name="notification" color={colors.primary} size={22} />
      </Pressable>
    </View>
  );
});

export default HomeHeader;
