import { TextInput, type TextInputProps, View } from "react-native";

import AppIcon from "../icons/AppIcon";
import { colors } from "../../theme";

type SearchFieldProps = Pick<
  TextInputProps,
  "onChangeText" | "placeholder" | "value"
>;

export default function SearchField({
  onChangeText,
  placeholder,
  value,
}: SearchFieldProps) {
  return (
    <View
      accessibilityLabel={placeholder}
      accessibilityRole="search"
      className="h-12 flex-row items-center gap-3 rounded-xl border border-border bg-surface px-4"
    >
      <AppIcon name="scan" color={colors.iconMuted} size={20} />
      <TextInput
        autoCapitalize="none"
        className="flex-1 py-0 text-[15px] text-foreground"
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        value={value}
      />
      <AppIcon name="filter-lines" color={colors.primary} size={20} />
    </View>
  );
}
