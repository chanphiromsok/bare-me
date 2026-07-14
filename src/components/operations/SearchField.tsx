import { Pressable, TextInput, type TextInputProps, View } from "react-native";

import AppIcon from "../icons/AppIcon";
import { colors } from "../../theme/colors";

type SearchFieldProps = Pick<
  TextInputProps,
  "onChangeText" | "placeholder" | "value"
> & {
  appearance?: "default" | "soft";
  filterAccessibilityLabel?: string;
  filterActive?: boolean;
  onFilterPress?: () => void;
  showFilterIcon?: boolean;
};

export default function SearchField({
  appearance = "default",
  filterAccessibilityLabel = "Open filters",
  filterActive = false,
  onChangeText,
  onFilterPress,
  placeholder,
  showFilterIcon = true,
  value,
}: SearchFieldProps) {
  return (
    <View
      accessibilityLabel={placeholder}
      accessibilityRole="search"
      className={
        appearance === "soft"
          ? "h-12 flex-row items-center gap-3 rounded-[14px] bg-surface-muted px-4"
          : "h-12 flex-row items-center gap-3 rounded-xl border border-border bg-surface px-4"
      }
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <AppIcon name="scan" color={colors.iconMuted} size={20} />
      </View>
      <TextInput
        autoCapitalize="none"
        className="flex-1 py-0 text-[15px] text-foreground"
        clearButtonMode="while-editing"
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        returnKeyType="search"
        value={value}
      />
      {showFilterIcon ? (
        onFilterPress ? (
          <Pressable
            accessibilityLabel={filterAccessibilityLabel}
            accessibilityRole="button"
            className="relative h-10 w-10 items-center justify-center rounded-full active:bg-primary-soft"
            hitSlop={4}
            onPress={onFilterPress}
          >
            <AppIcon name="filter-lines" color={colors.primary} size={20} />
            {filterActive ? (
              <View className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border border-surface bg-brand-orange" />
            ) : null}
          </Pressable>
        ) : (
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <AppIcon name="filter-lines" color={colors.primary} size={20} />
          </View>
        )
      ) : null}
    </View>
  );
}
