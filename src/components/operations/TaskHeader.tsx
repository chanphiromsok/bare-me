import { Pressable, Text, View } from "react-native";

import AppIcon from "../icons/AppIcon";
import { colors } from "../../theme";

type TaskHeaderProps = {
  onBack: () => void;
  subtitle: string;
  title: string;
};

export default function TaskHeader({
  onBack,
  subtitle,
  title,
}: TaskHeaderProps) {
  return (
    <View className="flex-row items-start gap-3 border-b border-border bg-surface px-5 pb-4 pt-safe-offset-3">
      <Pressable
        accessibilityLabel="Go back"
        accessibilityRole="button"
        className="h-11 w-11 items-center justify-center rounded-full bg-surface-muted active:bg-primary-soft"
        onPress={onBack}
      >
        <AppIcon name="arrow-range" color={colors.primary} size={20} />
      </Pressable>
      <View className="flex-1 pt-0.5">
        <Text className="text-xl font-bold text-foreground">{title}</Text>
        <Text className="mt-1 text-sm text-muted">{subtitle}</Text>
      </View>
    </View>
  );
}
