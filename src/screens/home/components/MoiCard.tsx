import { memo } from "react";
import { Pressable, Text, View } from "react-native";

import { cardStyles } from "./cardStyles";

export type MoiServiceItem = {
  title: string;
  description: string;
  mark: string;
};

const MoiCard = memo(function MoiCard({ item }: { item: MoiServiceItem }) {
  return (
    <Pressable
      accessibilityRole="button"
      className="min-h-[64px] flex-1 flex-row items-center gap-2.5 rounded-xl bg-surface p-3 active:opacity-80"
      style={cardStyles.card}
    >
      <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-soft">
        <Text className="text-[11px] font-extrabold text-primary">
          {item.mark}
        </Text>
      </View>
      <View className="min-w-0 flex-1">
        <Text
          className="text-[13px] font-bold leading-[17px] text-primary"
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text
          className="mt-0.5 text-[11px] leading-[14px] text-muted"
          numberOfLines={2}
        >
          {item.description}
        </Text>
      </View>
    </Pressable>
  );
});

export default MoiCard;
