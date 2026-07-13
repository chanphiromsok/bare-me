import { memo } from "react";
import { Pressable, Text, View } from "react-native";

import AppIcon from "../../../components/icons/AppIcon";
import { colors } from "../../../theme";
import { dashboardColors } from "./dashboardColors";

const BranchFilterRow = memo(function BranchFilterRow({
  branch,
  onPressBranch,
  onPressFilter,
}: {
  branch: string;
  onPressBranch?: () => void;
  onPressFilter?: () => void;
}) {
  return (
    <View className="flex-row items-center gap-[9px]">
      <Pressable
        accessibilityRole="button"
        className="h-9 flex-1 flex-row items-center justify-between rounded-[9px] border-[0.5px] border-primary/50 pl-[14px] pr-[15px] active:opacity-70"
        onPress={onPressBranch}
      >
        <Text className="text-[14px] font-light text-primary">{branch}</Text>
        <Text className="text-[17px] font-light leading-[19px] text-primary">
          ›
        </Text>
      </Pressable>
      <Pressable
        accessibilityLabel="Filters"
        accessibilityRole="button"
        className="h-9 w-[51px] items-center justify-center rounded-[9px] border-[0.5px] border-primary/50 active:opacity-70"
        style={{ backgroundColor: dashboardColors.filterButtonBg }}
        onPress={onPressFilter}
      >
        <AppIcon name="filter-lines" color={colors.primary} size={16} />
      </Pressable>
    </View>
  );
});

export default BranchFilterRow;
