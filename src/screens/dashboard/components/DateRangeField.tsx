import { memo } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import AppIcon from "../../../components/icons/AppIcon";
import { colors } from "../../../theme";

export type DateRange = {
  from: string;
  to: string;
};

const DateRangeField = memo(function DateRangeField({
  range,
  onPress,
}: {
  range: DateRange;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      className="h-[35px] flex-row items-center rounded-[7px] border-[0.5px] border-primary/50 px-[15px] active:opacity-70"
      onPress={onPress}
    >
      <Text className="text-[14px] font-light text-primary">{range.from}</Text>
      <AppIcon
        style={styles.rangeArrow}
        name="arrow-range"
        color={colors.primary}
        size={16}
      />
      <Text className="text-[14px] font-light text-primary">{range.to}</Text>
      <AppIcon
        style={styles.calendar}
        name="calendar"
        color={colors.primary}
        size={14}
      />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  calendar: {
    marginLeft: "auto",
  },
  rangeArrow: {
    marginHorizontal: 16,
  },
});

export default DateRangeField;
