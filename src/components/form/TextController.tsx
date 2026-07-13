import {
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from "react-native";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";

type TextControllerProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues, unknown, TFieldValues>;
  label?: string;
  name: FieldPath<TFieldValues>;
  rules?: RegisterOptions<TFieldValues, FieldPath<TFieldValues>>;
  wrapperStyle?: ViewStyle;
} & Omit<TextInputProps, "onBlur" | "onChange" | "value">;

const TextController = <TFieldValues extends FieldValues>({
  control,
  label,
  name,
  rules,
  wrapperStyle,
  ...inputProps
}: TextControllerProps<TFieldValues>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onBlur, onChange, value }, fieldState }) => (
        <View style={[styles.wrapper, wrapperStyle]}>
          {label ? <Text style={styles.label}>{label}</Text> : null}
          <TextInput
            {...inputProps}
            onBlur={onBlur}
            onChangeText={onChange}
            style={[
              styles.input,
              fieldState.error ? styles.inputError : null,
              inputProps.style,
            ]}
            value={value == null ? "" : String(value)}
          />
          {fieldState.error?.message ? (
            <Text style={styles.errorText}>{fieldState.error.message}</Text>
          ) : null}
        </View>
      )}
      rules={rules}
    />
  );
};

const styles = StyleSheet.create({
  errorText: {
    color: "#dc2626",
    fontSize: 12,
    lineHeight: 16,
  },
  input: {
    borderColor: "#d4d4d8",
    borderRadius: 8,
    borderWidth: 1,
    color: "#18181b",
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputError: {
    borderColor: "#dc2626",
  },
  label: {
    color: "#27272a",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  wrapper: {
    gap: 6,
  },
});

export default TextController;
