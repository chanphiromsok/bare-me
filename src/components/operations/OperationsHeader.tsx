import { Pressable, Text, View } from "react-native";

import AppIcon from "../icons/AppIcon";
import { colors } from "../../theme";

type OperationsHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

export default function OperationsHeader({
  eyebrow,
  title,
  subtitle,
}: OperationsHeaderProps) {
  return (
    <View className="gap-1 px-5 pb-4 pt-3">
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1">
          {eyebrow ? (
            <Text className="text-xs font-semibold uppercase tracking-[1.2px] text-brand-orange">
              {eyebrow}
            </Text>
          ) : null}
          <Text className="mt-1 text-[28px] font-bold leading-9 text-foreground">
            {title}
          </Text>
          {subtitle ? (
            <Text className="mt-1 text-[15px] leading-5 text-muted">
              {subtitle}
            </Text>
          ) : null}
        </View>
        <Pressable
          accessibilityLabel="Notifications"
          accessibilityRole="button"
          className="h-12 w-12 items-center justify-center rounded-full border border-border bg-surface active:bg-surface-muted"
        >
          <AppIcon name="notification" color={colors.textSubtle} size={23} />
          <View className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-brand-orange" />
        </Pressable>
      </View>
    </View>
  );
}
