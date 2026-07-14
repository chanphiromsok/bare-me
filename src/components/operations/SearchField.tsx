import { TextInput, type TextInputProps, View } from "react-native";

import AppIcon from "../icons/AppIcon";
import { colors } from "../../theme/colors";

type SearchFieldProps = Pick<
  TextInputProps,
  "onChangeText" | "placeholder" | "value"
> & {
  showFilterIcon?: boolean;
};

export default function SearchField({
  onChangeText,
  placeholder,
  showFilterIcon = true,
  value,
}: SearchFieldProps) {
  return (
    <View
      accessibilityLabel={placeholder}
      accessibilityRole="search"
      className="h-12 flex-row items-center gap-3 rounded-xl border border-border bg-surface px-4"
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
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <AppIcon name="filter-lines" color={colors.primary} size={20} />
        </View>
      ) : null}
    </View>
  );
}
